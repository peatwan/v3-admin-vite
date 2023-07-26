<template>
  <div class="app-container">
    <div class="search-wrapper">
      <DxTextBox :value="username" :max-length="40" styling-mode="outlined" label="用户名" />
      <DxTextBox :value="phone" :max-length="40" styling-mode="outlined" label="手机号" />
      <DxButton class="action-button" text="查询" styling-mode="contained" type="default" icon="search" />
      <DxButton class="action-button" text="重置" styling-mode="contained" type="normal" icon="revert" />
    </div>
    <div class="table-wrapper">
      <div class="toolbar-wrapper">
        <div class="buttons">
          <DxButton text="新增用户" styling-mode="contained" type="default" icon="add" />
          <DxButton text="批量删除" styling-mode="contained" type="danger" icon="trash" />
        </div>
        <div class="buttons">
          <DxButton styling-mode="contained" icon="download" />
          <DxButton styling-mode="contained" icon="refresh" />
        </div>
      </div>
      <div>
        <DxDataGrid :allow-column-reordering="true" :data-source="customers" key-expr="ID" :show-borders="false">
          <DxColumn data-field="CompanyName" />
          <DxColumn data-field="Phone" />
          <DxColumn data-field="Fax" />
          <DxColumn data-field="City" />
          <DxColumn :group-index="0" data-field="State" />

          <DxGroupPanel :visible="true" />
          <DxGrouping :auto-expand-all="autoExpandAll" />
          <DxPaging :page-size="10" />
          <DxSearchPanel :visible="true" />
        </DxDataGrid>
      </div>

      <div class="options">
        <div class="caption">Options</div>
        <div class="option">
          <DxCheckBox id="autoExpand" v-model:value="autoExpandAll" text="Expand All Groups" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DxCheckBox from "devextreme-vue/check-box"
import { DxDataGrid, DxColumn, DxGrouping, DxGroupPanel, DxSearchPanel, DxPaging } from "devextreme-vue/data-grid"
import { customers } from "./data.js"
import DxTextBox from "devextreme-vue/text-box"
import DxButton from "devextreme-vue/button"

export default {
  components: {
    DxCheckBox,
    DxColumn,
    DxGroupPanel,
    DxGrouping,
    DxPaging,
    DxSearchPanel,
    DxDataGrid,
    DxTextBox,
    DxButton
  },
  name: "DevExtremeTable",
  data() {
    return {
      autoExpandAll: true,
      customers,
      username: "",
      phone: ""
    }
  }
}
</script>
<style lang="scss" scoped>
.options {
  padding: 20px;
  margin-top: 20px;
  background-color: rgba(191, 191, 191, 0.15);
}

.caption {
  font-size: 18px;
  font-weight: 500;
}

.option {
  margin-top: 10px;
}

.search-wrapper {
  margin-bottom: 20px;
  background-color: rgb(255, 255, 255);
  display: flex;
  justify-content: flex-start;
  padding: 15px;
  gap: 15px;
  .action-button {
    margin-top: 7.5px;
  }
}

.table-wrapper {
  margin-bottom: 20px;
  padding: 15px;
  background-color: rgb(255, 255, 255);
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
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
