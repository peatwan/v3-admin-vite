import { ref, reactive } from "vue"
import ArrayStore from "devextreme/data/array_store"
import DataSource from "devextreme/data/data_source"
import { throttle } from "lodash-es"
import { DxDataGrid } from "devextreme-vue"
import { ScrollEvent } from "devextreme/ui/scroll_view"

interface DefaultPaginationData {
  currentPage: number
  pageSize: number
}

interface PaginationData {
  currentPage?: number
  pageSize?: number
}

/** 默认的分页参数 */
const defaultPaginationData: DefaultPaginationData = {
  currentPage: 1,
  pageSize: 20
}

export function useDataGrid(paginationEnbaled: boolean = true, initialPaginationData: PaginationData = {}) {
  let store: ArrayStore | null
  let index = 1
  let scrollEventIsSet = false
  const lastPage = false
  const paginationData = reactive({ ...defaultPaginationData, ...initialPaginationData })
  const dataSource = ref<DataSource>()
  const gridContainer = ref<DxDataGrid>()

  /**
   * 首次获取数据后初始化 dataSource
   * @param data
   */
  const initDataSource = (data: Array<any>) => {
    data.forEach((e) => {
      e._index = index
      index++
    })
    store = new ArrayStore({
      key: "_index",
      data: data
    })
    dataSource.value = new DataSource({
      store: store,
      reshapeOnPush: true
    })
  }

  /**
   * content-ready 事件处理，绑定 scroll 监听器
   */
  const onContentReady = () => {
    if (paginationEnbaled && !scrollEventIsSet) {
      const scrollView = gridContainer.value?.instance?.getScrollable()
      if (scrollView) {
        scrollView.on("scroll", throttle(handleScroll, 100))
        scrollEventIsSet = true
      }
    }
  }

  /**
   * 滚动("scroll")事件处理，用于获取下一页数据
   * @param event 滚动事件
   */
  const handleScroll = (event: ScrollEvent) => {
    if (paginationEnbaled && event.reachedBottom) {
      if (lastPage) {
        return
      }
      nextPage()
    }
  }

  /**
   * 将 data 添加到 DataGrid 数据源尾部
   * @param data Array
   */
  const pushData = (data: Array<any>) => {
    if (!(store instanceof ArrayStore)) {
      initDataSource(data)
    } else {
      const tmpDataArr: Array<{
        type: "insert"
        data?: Array<any>
      }> = []
      data.forEach((e) => {
        e._index = index
        index++
        tmpDataArr.push({ type: "insert", data: e })
      })
      store.push(tmpDataArr)
    }
  }

  /**
   * 清空 DataGrid 数据
   */
  const clearData = () => {
    if (store instanceof ArrayStore) {
      store.clear()
    }
    store = null
  }

  /**
   * 将 data 添加到 DataGrid 数据源头部
   * @param data Array
   */
  const unshiftData = (data: Array<any>) => {
    if (!(store instanceof ArrayStore)) {
      initDataSource(data)
    } else {
      const tmpDataArr: Array<{
        type: "insert"
        data?: any
        index: number
      }> = []
      data.forEach((e) => {
        e._index = index
        index++
        tmpDataArr.push({ type: "insert", data: e, index: 0 })
      })
      store.push(tmpDataArr)
    }
  }

  /**
   * 更新 DataGrid 的一行数据
   * @param key 需要更新的数据的 key
   * @param value 需要更新的数据的 value
   */
  const updateData = (key: any, value: any) => {
    if (!(store instanceof ArrayStore)) {
      return
    }
    store.push([{ type: "update", data: value, key: key }])
  }

  /**
   * 删除 DataGrid 的一行数据
   * @param key 需要删除的数据的 key
   */
  const deleteData = (key: any) => {
    if (!(store instanceof ArrayStore)) {
      return
    }
    store.push([{ type: "remove", key: key }])
  }

  /**
   * 删除 DataGrid 的多行数据
   * @param keys 需要删除的数据的 key 的数组
   */
  const batchDeleteData = (keys: Array<any>) => {
    if (!(store instanceof ArrayStore)) {
      return
    }
    const tmpArr: Array<{
      type: "remove"
      key?: any
    }> = []
    keys.forEach((e: any) => {
      tmpArr.push({ type: "remove", key: e })
    })
    store.push(tmpArr)
  }

  /**
   * 获取下页数据
   */
  const nextPage = () => {
    paginationData.currentPage++
  }

  return {
    paginationData,
    dataSource,
    gridContainer,
    onContentReady,
    pushData,
    clearData,
    unshiftData,
    updateData,
    deleteData,
    batchDeleteData
  }
}
