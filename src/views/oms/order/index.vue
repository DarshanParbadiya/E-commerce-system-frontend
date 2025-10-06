<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>Filter & Search</span>
        <el-button style="float:right" type="primary" @click="handleSearchList()" size="small">
          Search
        </el-button>
        <el-button style="float:right;margin-right: 15px" @click="handleResetSearch()" size="small">
          Reset
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="Search Input:">
            <el-input v-model="listQuery.orderSn" class="input-width" placeholder="Order Number"></el-input>
          </el-form-item>
          <el-form-item label="Receiver:">
            <el-input v-model="listQuery.receiverKeyword" class="input-width"
              placeholder="Receiver Name / Phone"></el-input>
          </el-form-item>
          <el-form-item label="Submission Date:">
            <el-date-picker class="input-width" v-model="listQuery.createTime" value-format="yyyy-MM-dd" type="date"
              placeholder="Select Date">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="Order Status:">
            <el-select v-model="listQuery.status" class="input-width" placeholder="All" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Order Type:">
            <el-select v-model="listQuery.orderType" class="input-width" placeholder="All" clearable>
              <el-option v-for="item in orderTypeOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Order Source:">
            <el-select v-model="listQuery.sourceType" class="input-width" placeholder="All" clearable>
              <el-option v-for="item in sourceTypeOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>Data List</span>
    </el-card>

    <div class="table-container">
      <el-table ref="orderTable" :data="list" style="width: 100%;" @selection-change="handleSelectionChange"
        v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="ID" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="Order Number" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.orderSn }}</template>
        </el-table-column>
        <el-table-column label="Submission Time" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatCreateTime }}</template>
        </el-table-column>
        <el-table-column label="User Account" align="center">
          <template slot-scope="scope">{{ scope.row.memberUsername }}</template>
        </el-table-column>
        <el-table-column label="Order Amount" width="120" align="center">
          <template slot-scope="scope">${{ scope.row.totalAmount }}</template>
        </el-table-column>
        <el-table-column label="Payment Method" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.payType | formatPayType }}</template>
        </el-table-column>
        <el-table-column label="Order Source" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.sourceType | formatSourceType }}</template>
        </el-table-column>
        <el-table-column label="Order Status" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.status | formatStatus }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleViewOrder(scope.$index, scope.row)">View Order</el-button>
            <el-button size="mini" @click="handleCloseOrder(scope.$index, scope.row)"
              v-show="scope.row.status === 0">Close Order</el-button>
            <el-button size="mini" @click="handleDeliveryOrder(scope.$index, scope.row)"
              v-show="scope.row.status === 1">Deliver Order</el-button>
            <el-button size="mini" @click="handleViewLogistics(scope.$index, scope.row)"
              v-show="scope.row.status === 2 || scope.row.status === 3">Track Order</el-button>
            <el-button size="mini" type="danger" @click="handleDeleteOrder(scope.$index, scope.row)"
              v-show="scope.row.status === 4">Delete Order</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="batch-operate-container">
      <el-select size="small" v-model="operateType" placeholder="Batch Operation">
        <el-option v-for="item in operateOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      <el-button style="margin-left: 20px" class="search-button" @click="handleBatchOperate()" type="primary"
        size="small">
        Confirm
      </el-button>
    </div>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper" :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize" :page-sizes="[5, 10, 15]" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="Close Order" :visible.sync="closeOrder.dialogVisible" width="30%">
      <span style="vertical-align: top">Remarks:</span>
      <el-input style="width: 80%" type="textarea" :rows="5" placeholder="Enter content" v-model="closeOrder.content">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeOrder.dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleCloseOrderConfirm">Confirm</el-button>
      </span>
    </el-dialog>

    <logistics-dialog v-model="logisticsDialogVisible"></logistics-dialog>
  </div>
</template>

<script>
import { fetchList, closeOrder, deleteOrder } from '@/api/order';
import { formatDate } from '@/utils/date';
import LogisticsDialog from '@/views/oms/order/components/logisticsDialog';

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  orderSn: null,
  receiverKeyword: null,
  status: null,
  orderType: null,
  sourceType: null,
  createTime: null
};

export default {
  name: "orderList",
  components: { LogisticsDialog },
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      listLoading: true,
      list: null,
      total: null,
      operateType: null,
      multipleSelection: [],
      closeOrder: {
        dialogVisible: false,
        content: null,
        orderIds: []
      },
      statusOptions: [
        { label: 'Pending Payment', value: 0 },
        { label: 'Pending Shipment', value: 1 },
        { label: 'Shipped', value: 2 },
        { label: 'Completed', value: 3 },
        { label: 'Closed', value: 4 }
      ],
      orderTypeOptions: [
        { label: 'Normal Order', value: 0 },
        { label: 'Flash Sale Order', value: 1 }
      ],
      sourceTypeOptions: [
        { label: 'PC Order', value: 0 },
        { label: 'APP Order', value: 1 }
      ],
      operateOptions: [
        { label: "Batch Deliver", value: 1 },
        { label: "Close Orders", value: 2 },
        { label: "Delete Orders", value: 3 }
      ],
      logisticsDialogVisible: false
    }
  },
  created() {
    this.getList();
  },
  filters: {
    formatCreateTime(time) {
      return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss');
    },
    formatPayType(value) {
      if (value === 1) return 'Alipay';
      else if (value === 2) return 'WeChat';
      else return 'Unpaid';
    },
    formatSourceType(value) {
      return value === 1 ? 'APP Order' : 'PC Order';
    },
    formatStatus(value) {
      switch (value) {
        case 1: return 'Pending Shipment';
        case 2: return 'Shipped';
        case 3: return 'Completed';
        case 4: return 'Closed';
        case 5: return 'Invalid Order';
        default: return 'Pending Payment';
      }
    }
  },
  methods: {
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery);
    },
    handleSearchList() {
      this.listQuery.pageNum = 1;
      this.getList();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleViewOrder(index, row) {
      this.$router.push({ path: '/oms/orderDetail', query: { id: row.id } });
    },
    handleCloseOrder(index, row) {
      this.closeOrder.dialogVisible = true;
      this.closeOrder.orderIds = [row.id];
    },
    handleDeliveryOrder(index, row) {
      this.$router.push({ path: '/oms/deliverOrderList', query: { list: [this.covertOrder(row)] } });
    },
    handleViewLogistics(index, row) {
      this.logisticsDialogVisible = true;
    },
    handleDeleteOrder(index, row) {
      this.deleteOrder([row.id]);
    },
    handleBatchOperate() {
      if (!this.multipleSelection || this.multipleSelection.length < 1) {
        this.$message({ message: 'Please select orders to operate', type: 'warning', duration: 1000 });
        return;
      }
      if (this.operateType === 1) {
        // Batch deliver
        const list = this.multipleSelection.filter(item => item.status === 1).map(this.covertOrder);
        if (list.length === 0) {
          this.$message({ message: 'No deliverable orders selected', type: 'warning', duration: 1000 });
          return;
        }
        this.$router.push({ path: '/oms/deliverOrderList', query: { list } });
      } else if (this.operateType === 2) {
        // Close orders
        this.closeOrder.orderIds = this.multipleSelection.map(item => item.id);
        this.closeOrder.dialogVisible = true;
      } else if (this.operateType === 3) {
        // Delete orders
        this.deleteOrder(this.multipleSelection.map(item => item.id));
      }
    },
    handleSizeChange(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleCloseOrderConfirm() {
      if (!this.closeOrder.content) {
        this.$message({ message: 'Remarks cannot be empty', type: 'warning', duration: 1000 });
        return;
      }
      const params = new URLSearchParams();
      params.append('ids', this.closeOrder.orderIds);
      params.append('note', this.closeOrder.content);
      closeOrder(params).then(() => {
        this.closeOrder.orderIds = [];
        this.closeOrder.dialogVisible = false;
        this.getList();
        this.$message({ message: 'Update successful', type: 'success', duration: 1000 });
      });
    },
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        this.listLoading = false;
        this.list = response.data.list;
        this.total = response.data.total;
      });
    },
    deleteOrder(ids) {
      this.$confirm('Do you want to perform this delete operation?', 'Confirmation', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams();
        params.append("ids", ids);
        deleteOrder(params).then(() => {
          this.$message({ message: 'Deleted successfully!', type: 'success', duration: 1000 });
          this.getList();
        });
      });
    },
    covertOrder(order) {
      const address = order.receiverProvince + order.receiverCity + order.receiverRegion + order.receiverDetailAddress;
      return {
        orderId: order.id,
        orderSn: order.orderSn,
        receiverName: order.receiverName,
        receiverPhone: order.receiverPhone,
        receiverPostCode: order.receiverPostCode,
        address,
        deliveryCompany: null,
        deliverySn: null
      };
    }
  }
}
</script>

<style scoped>
.input-width {
  width: 203px;
}
</style>
