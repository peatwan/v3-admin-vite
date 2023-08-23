<template>
  <div class="app-container">
    <div class="search-wrapper">
      <DxTextBox v-model="searchData.username" :max-length="40" styling-mode="outlined" label="用户名" />
      <DxTextBox v-model="searchData.phone" :max-length="40" styling-mode="outlined" label="手机号" />
      <DxButton
        class="action-button"
        text="查询"
        styling-mode="contained"
        type="default"
        icon="search"
        :disabled="loading"
        @click="handleSearch"
      />
      <DxButton
        class="action-button"
        text="重置"
        styling-mode="contained"
        type="normal"
        icon="revert"
        :disabled="loading"
        @click="resetSearch"
      />
    </div>
    <div class="data-grid-wrapper">
      <div class="toolbar-wrapper">
        <div class="buttons">
          <DxButton text="新增用户" styling-mode="contained" type="default" icon="add" @click="dialogVisible = true" />
          <DxButton
            text="批量删除"
            styling-mode="contained"
            type="danger"
            icon="trash"
            @click="selectedRowKeys ? batchDeleteData(selectedRowKeys) : () => {}"
          />
        </div>
      </div>
      <div class="table-wrapper">
        <DxDataGrid
          class="dx-data-grid-containner"
          ref="gridContainer"
          :allow-column-reordering="true"
          :data-source="dataSource"
          :show-borders="false"
          :columnAutoWidth="false"
          :showRowLines="true"
          :showColumnLines="false"
          column-resizing-mode="widget"
          @exporting="onExporting"
          @content-ready="onContentReady"
          @selectionChanged="handleSelectionChanged"
        >
          <DxHeaderFilter :visible="true" />
          <DxColumn data-field="username" caption="用户名" alignment="center" />
          <DxColumn data-field="roles" caption="角色" cell-template="role-cell" alignment="center" />
          <template #role-cell="{ data }">
            <el-tag v-if="data.data.roles === 'admin'" effect="plain">admin</el-tag>
            <el-tag v-else type="warning" effect="plain">{{ data.data.roles }}</el-tag>
          </template>

          <DxColumn data-field="phone" caption="手机号" alignment="center" />
          <DxColumn data-field="email" caption="邮箱" alignment="center" />
          <DxColumn data-field="status" caption="状态" cell-template="status-cell" alignment="center" />
          <template #status-cell="{ data }">
            <el-tag v-if="data.data.status" type="success" effect="plain">启用</el-tag>
            <el-tag v-else type="danger" effect="plain">禁用</el-tag>
          </template>
          <DxColumn data-field="createTime" caption="创建时间" alignment="center" />
          <DxColumn caption="操作" cell-template="action-cell" alignment="center" />
          <template #action-cell="{ data }">
            <el-button type="primary" text bg size="small" @click="handleUpdate(data.data)">修改</el-button>
            <el-button type="danger" text bg size="small" @click="handleDelete(data.data)">删除</el-button>
          </template>
          <DxColumnChooser :enabled="true" mode="select">
            <DxPosition my="right top" at="right bottom" of=".dx-datagrid-column-chooser-button" />

            <DxColumnChooserSearch :enabled="true" />
            <DxColumnChooserSelection :allow-select-all="true" />
          </DxColumnChooser>

          <DxGroupPanel :visible="true" />
          <DxGrouping />
          <DxSearchPanel :visible="true" />
          <DxSelection mode="multiple" />
          <DxExport :enabled="true" :allow-export-selected-data="true" />
          <DxScrolling mode="virtual" :render-async="false" />
        </DxDataGrid>
      </div>
      <div style="text-align: right">
        <ElTooltip content="回到顶部" effect="light">
          <el-button icon="DArrowLeft" @click="goTop" />
        </ElTooltip>
        <ElTooltip content="最后一页" effect="light">
          <el-button icon="DArrowRight" @click="goLastPage" :disabled="lastPage" />
        </ElTooltip>
      </div>
    </div>
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentUpdateId === undefined ? '新增用户' : '修改用户'"
      @close="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="formData.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="password" label="密码" v-if="currentUpdateId === undefined">
          <el-input v-model="formData.password" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch, onActivated, onBeforeUnmount } from "vue"
import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table/"
import { type GetTableData } from "@/api/table/types/table"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox, ElButton, ElTooltip } from "element-plus"

import {
  DxDataGrid,
  DxColumn,
  DxGrouping,
  DxGroupPanel,
  DxSearchPanel,
  DxSelection,
  DxHeaderFilter,
  DxExport,
  DxColumnChooser,
  DxColumnChooserSearch,
  DxColumnChooserSelection,
  DxPosition,
  DxScrolling
} from "devextreme-vue/data-grid"
import DxTextBox from "devextreme-vue/text-box"
import DxButton from "devextreme-vue/button"
import { Workbook } from "exceljs"
import { saveAs } from "file-saver"
import { exportDataGrid } from "devextreme/excel_exporter"
import { useDxDataGrid } from "@/hooks/useDxDataGrid"
import { ExportingEvent, SelectionChangedEvent } from "devextreme/ui/data_grid"

defineOptions({
  // 命名当前组件
  name: "DevExtremeTable"
})

const loading = ref<boolean>(false)

const {
  paginationData,
  dataSource,
  gridContainer,
  lastPage,
  pushData,
  clearData,
  deleteData,
  batchDeleteData,
  updateData,
  onContentReady
} = useDxDataGrid<GetTableData>()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  username: "",
  password: ""
})
const formRules: FormRules = reactive({
  username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }]
})
const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        createTableDataApi(formData)
          .then(() => {
            const newTableData: GetTableData = {
              createTime: "",
              email: "",
              id: "",
              phone: "",
              roles: "",
              status: true,
              username: formData.username
            }
            pushData([newTableData])
            ElMessage.success("新增成功")
          })
          .finally(() => {
            dialogVisible.value = false
          })
      } else {
        updateTableDataApi({
          id: currentUpdateId.value,
          username: formData.username
        })
          .then(() => {
            if (currentUpdateRow.value && currentUpdateRow.value._key) {
              currentUpdateRow.value.username = formData.username
              updateData(currentUpdateRow.value._key, currentUpdateRow.value)
            }
            ElMessage.success("修改成功")
          })
          .finally(() => {
            dialogVisible.value = false
          })
      }
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}
const resetForm = () => {
  currentUpdateId.value = undefined
  currentUpdateRow.value = undefined
  formData.username = ""
  formData.password = ""
}
//#endregion

//#region 删
const handleDelete = (row: GetTableData) => {
  ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteTableDataApi(row.id).then(() => {
      if (row._key) {
        deleteData(row._key)
      }
      ElMessage.success("删除成功")
      // getTableData()
    })
  })
}
const selectedRowKeys = ref<number[]>()
const handleSelectionChanged = (event: SelectionChangedEvent) => {
  selectedRowKeys.value = event.selectedRowKeys
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const currentUpdateRow = ref<GetTableData>()
const handleUpdate = (row: GetTableData) => {
  currentUpdateId.value = row.id
  currentUpdateRow.value = row
  formData.username = row.username
  dialogVisible.value = true
}
//#endregion

//#region 查
const searchData = reactive({
  username: "",
  phone: ""
})

const getTableData = () => {
  if (lastPage.value) return
  loading.value = true
  getTableDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    username: searchData.username || undefined,
    phone: searchData.phone || undefined
  })
    .then((res) => {
      pushData(res.data.list)
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}
const handleSearch = () => {
  clearData()
  lastPage.value = false
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchData.username = ""
  searchData.phone = ""
  handleSearch()
}
//#endregion

onActivated(() => {
  // 调用时机为首次挂载
  // 以及每次从缓存中被重新插入时
  gridContainer.value?.instance?.refresh()
})

onBeforeUnmount(() => {
  clearData()
})

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage], getTableData, { immediate: true })
/** 监听 loading 判断是否显示 loadPanel */
watch(loading, () => {
  if (loading.value) {
    gridContainer.value?.instance?.beginCustomLoading("")
  } else {
    gridContainer.value?.instance?.endCustomLoading()
  }
})

/**
 * 导出 DataGrid 数据
 */
const onExporting = (e: ExportingEvent) => {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet("Employees")

  exportDataGrid({
    component: e.component,
    worksheet,
    autoFilterEnabled: true
  }).then(() => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer], { type: "application/octet-stream" }), "DataGrid.xlsx")
    })
  })
  e.cancel = true
}

/**
 * 回到顶部
 */
const goTop = () => {
  gridContainer.value?.instance?.getScrollable().scrollTo(0)
}

/**
 * 获取所有数据
 * @param pageNum 最后一页的页码
 */
const getAllTableData = async (pageNum?: number) => {
  if (pageNum) {
    let i = paginationData.currentPage + 1
    for (; i <= pageNum; i++) {
      await getTableDataApi({
        currentPage: i,
        size: paginationData.pageSize,
        username: searchData.username || undefined,
        phone: searchData.phone || undefined
      }).then((res) => {
        pushData(res.data.list)
      })
    }
    paginationData.currentPage = i - 1
  }
}

/**
 * 翻到最后一页(加载所有数据)
 */
const goLastPage = () => {
  lastPage.value = true
  loading.value = true
  getAllTableData(20).finally(() => {
    loading.value = false
  })
}
</script>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  padding: 15px;
  gap: 15px;
  .action-button {
    margin-top: 7.5px;
  }
}

.data-grid-wrapper {
  // margin-bottom: 10px;
  padding: 15px;
  .toolbar-wrapper {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    .buttons {
      justify-content: space-between;
      gap: 15px;
      display: flex;
    }
  }
  .table-wrapper {
    margin-bottom: 10px;
    .dx-data-grid-containner {
      height: 620px;
    }
  }
}
</style>
