<template>
  <div class="detail-container">
    <div>
      <el-steps :active="formatStepStatus(order.status)" finish-status="success" align-center>
        <el-step title="Submit Order" :description="formatTime(order.createTime)"></el-step>
        <el-step title="Pay Order" :description="formatTime(order.paymentTime)"></el-step>
        <el-step title="Platform Shipping" :description="formatTime(order.deliveryTime)"></el-step>
        <el-step title="Confirm Receipt" :description="formatTime(order.receiveTime)"></el-step>
        <el-step title="Complete Review" :description="formatTime(order.commentTime)"></el-step>
      </el-steps>
    </div>
    <el-card shadow="never" style="margin-top: 15px">
      <div class="operate-container">
        <i class="el-icon-warning color-danger" style="margin-left: 20px"></i>
        <span class="color-danger">Current Order Status: {{ order.status | formatStatus }}</span>
        <div class="operate-button-container" v-show="order.status === 0">
          <el-button size="mini" @click="showUpdateReceiverDialog">Edit Recipient Info</el-button>
          <el-button size="mini" @click="showUpdateMoneyDialog">Edit Payment Info</el-button>
          <el-button size="mini" @click="showMessageDialog">Send Message</el-button>
          <el-button size="mini" @click="showCloseOrderDialog">Close Order</el-button>
          <el-button size="mini" @click="showMarkOrderDialog">Add Note</el-button>
        </div>
        <div class="operate-button-container" v-show="order.status === 1">
          <el-button size="mini" @click="showUpdateReceiverDialog">Edit Recipient Info</el-button>
          <el-button size="mini" @click="showMessageDialog">Send Message</el-button>
          <el-button size="mini">Cancel Order</el-button>
          <el-button size="mini" @click="showMarkOrderDialog">Add Note</el-button>
        </div>
        <div class="operate-button-container" v-show="order.status === 2 || order.status === 3">
          <el-button size="mini" @click="showLogisticsDialog">Track Order</el-button>
          <el-button size="mini" @click="showMessageDialog">Send Message</el-button>
          <el-button size="mini" @click="showMarkOrderDialog">Add Note</el-button>
        </div>
        <div class="operate-button-container" v-show="order.status === 4">
          <el-button size="mini" @click="handleDeleteOrder">Delete Order</el-button>
          <el-button size="mini" @click="showMarkOrderDialog">Add Note</el-button>
        </div>
      </div>
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">Basic Information</span>
      </div>

      <div class="table-layout">
        <el-row>
          <el-col :span="4" class="table-cell-title">Order Number</el-col>
          <el-col :span="4" class="table-cell-title">Shipment Serial Number</el-col>
          <el-col :span="4" class="table-cell-title">User Account</el-col>
          <el-col :span="4" class="table-cell-title">Payment Method</el-col>
          <el-col :span="4" class="table-cell-title">Order Source</el-col>
          <el-col :span="4" class="table-cell-title">Order Type</el-col>
        </el-row>

        <el-row>
          <el-col :span="4" class="table-cell">{{ order.orderSn }}</el-col>
          <el-col :span="4" class="table-cell">N/A</el-col>
          <el-col :span="4" class="table-cell">{{ order.memberUsername }}</el-col>
          <el-col :span="4" class="table-cell">{{ order.payType | formatPayType }}</el-col>
          <el-col :span="4" class="table-cell">{{ order.sourceType | formatSourceType }}</el-col>
          <el-col :span="4" class="table-cell">{{ order.orderType | formatOrderType }}</el-col>
        </el-row>

        <el-row>
          <el-col :span="4" class="table-cell-title">Delivery Method</el-col>
          <el-col :span="4" class="table-cell-title">Tracking Number</el-col>
          <el-col :span="4" class="table-cell-title">Auto-Confirm Receipt (Days)</el-col>
          <el-col :span="4" class="table-cell-title">Points Earned</el-col>
          <el-col :span="4" class="table-cell-title">Growth Value</el-col>
          <el-col :span="4" class="table-cell-title">Promotion Info</el-col>
        </el-row>

        <el-row>
          <el-col :span="4" class="table-cell">{{ order.deliveryCompany | formatNull }}</el-col>
          <el-col :span="4" class="table-cell">{{ order.deliverySn | formatNull }}</el-col>
          <el-col :span="4" class="table-cell">{{ order.autoConfirmDay }} days</el-col>
          <el-col :span="4" class="table-cell">{{ order.integration }}</el-col>
          <el-col :span="4" class="table-cell">{{ order.growth }}</el-col>
          <el-col :span="4" class="table-cell">
            <el-popover placement="top-start" title="Promotion Info" width="200" trigger="hover"
              :content="order.promotionInfo">
              <span slot="reference">{{ order.promotionInfo | formatLongText }}</span>
            </el-popover>
          </el-col>
        </el-row>
      </div>

      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">Recipient Information</span>
      </div>

      <div class="table-layout">
        <el-row>
          <el-col :span="6" class="table-cell-title">Recipient Name</el-col>
          <el-col :span="6" class="table-cell-title">Phone Number</el-col>
          <el-col :span="6" class="table-cell-title">Postal Code</el-col>
          <el-col :span="6" class="table-cell-title">Address</el-col>
        </el-row>

        <el-row>
          <el-col :span="6" class="table-cell">{{ order.receiverName }}</el-col>
          <el-col :span="6" class="table-cell">{{ order.receiverPhone }}</el-col>
          <el-col :span="6" class="table-cell">{{ order.receiverPostCode }}</el-col>
          <el-col :span="6" class="table-cell">{{ order | formatAddress }}</el-col>
        </el-row>
      </div>

      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">Product Information</span>
      </div>

      <el-table ref="orderItemTable" :data="order.orderItemList" style="width: 100%;margin-top: 20px" border>
        <el-table-column label="Product Image" width="120" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.productPic" style="height: 80px">
          </template>
        </el-table-column>

        <el-table-column label="Product Name" align="center">
          <template slot-scope="scope">
            <p>{{ scope.row.productName }}</p>
            <p>Brand: {{ scope.row.productBrand }}</p>
          </template>
        </el-table-column>

        <el-table-column label="Price / SKU" width="120" align="center">
          <template slot-scope="scope">
            <p>Price: ¥{{ scope.row.productPrice }}</p>
            <p>SKU: {{ scope.row.productSn }}</p>
          </template>
        </el-table-column>

        <el-table-column label="Attributes" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.productAttr | formatProductAttr }}
          </template>
        </el-table-column>

        <el-table-column label="Quantity" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.productQuantity }}
          </template>
        </el-table-column>

        <el-table-column label="Subtotal" width="120" align="center">
          <template slot-scope="scope">
            ¥{{ scope.row.productPrice * scope.row.productQuantity }}
          </template>
        </el-table-column>
      </el-table>

      <div style="float: right;margin: 20px">
        Total: <span class="color-danger">¥{{ order.totalAmount }}</span>
      </div>

      <div style="margin-top: 60px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">Payment Information</span>
      </div>

      <div class="table-layout">
        <el-row>
          <el-col :span="6" class="table-cell-title">Product Total</el-col>
          <el-col :span="6" class="table-cell-title">Shipping Fee</el-col>
          <el-col :span="6" class="table-cell-title">Coupon</el-col>
          <el-col :span="6" class="table-cell-title">Points Deduction</el-col>
        </el-row>

        <el-row>
          <el-col :span="6" class="table-cell">¥{{ order.totalAmount }}</el-col>
          <el-col :span="6" class="table-cell">¥{{ order.freightAmount }}</el-col>
          <el-col :span="6" class="table-cell">-¥{{ order.couponAmount }}</el-col>
          <el-col :span="6" class="table-cell">-¥{{ order.integrationAmount }}</el-col>
        </el-row>

        <el-row>
          <el-col :span="6" class="table-cell-title">Promotion Discount</el-col>
          <el-col :span="6" class="table-cell-title">Discount Amount</el-col>
          <el-col :span="6" class="table-cell-title">Order Total</el-col>
          <el-col :span="6" class="table-cell-title">Amount Payable</el-col>
        </el-row>

        <el-row>
          <el-col :span="6" class="table-cell">-¥{{ order.promotionAmount }}</el-col>
          <el-col :span="6" class="table-cell">-¥{{ order.discountAmount }}</el-col>
          <el-col :span="6" class="table-cell">
            <span class="color-danger">¥{{ order.totalAmount + order.freightAmount }}</span>
          </el-col>
          <el-col :span="6" class="table-cell">
            <span class="color-danger">¥{{ order.payAmount + order.freightAmount - order.discountAmount }}</span>
          </el-col>
        </el-row>
      </div>

      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">Action History</span>
      </div>

      <el-table style="margin-top: 20px;width: 100%" ref="orderHistoryTable" :data="order.historyList" border>
        <el-table-column label="Operator" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.operateMan }}
          </template>
        </el-table-column>

        <el-table-column label="Operation Time" width="160" align="center">
          <template slot-scope="scope">
            {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="Order Status" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.orderStatus | formatStatus }}
          </template>
        </el-table-column>

        <el-table-column label="Payment Status" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.orderStatus | formatPayStatus }}
          </template>
        </el-table-column>

        <el-table-column label="Delivery Status" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.orderStatus | formatDeliverStatus }}
          </template>
        </el-table-column>

        <el-table-column label="Note" align="center">
          <template slot-scope="scope">
            {{ scope.row.note }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <template>
      <el-dialog title="Edit Recipient Information" :visible.sync="receiverDialogVisible" width="40%">
        <el-form :model="receiverInfo" ref="receiverInfoForm" label-width="150px">
          <el-form-item label="Recipient Name:">
            <el-input v-model="receiverInfo.receiverName" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="Phone Number:">
            <el-input v-model="receiverInfo.receiverPhone" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="Postal Code:">
            <el-input v-model="receiverInfo.receiverPostCode" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="Region:">
            <v-distpicker :province="receiverInfo.receiverProvince" :city="receiverInfo.receiverCity"
              :area="receiverInfo.receiverRegion" @selected="onSelectRegion"></v-distpicker>
          </el-form-item>
          <el-form-item label="Detailed Address:">
            <el-input v-model="receiverInfo.receiverDetailAddress" type="textarea" rows="3"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="receiverDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleUpdateReceiverInfo">Confirm</el-button>
        </span>
      </el-dialog>

      <el-dialog title="Edit Cost Information" :visible.sync="moneyDialogVisible" width="40%">
        <div class="table-layout">
          <el-row>
            <el-col :span="6" class="table-cell-title">Product Total</el-col>
            <el-col :span="6" class="table-cell-title">Shipping Fee</el-col>
            <el-col :span="6" class="table-cell-title">Coupon</el-col>
            <el-col :span="6" class="table-cell-title">Points Deduction</el-col>
          </el-row>
          <el-row>
            <el-col :span="6" class="table-cell">${{ order.totalAmount }}</el-col>
            <el-col :span="6" class="table-cell">
              <el-input v-model.number="moneyInfo.freightAmount" size="mini"><template
                  slot="prepend">$</template></el-input>
            </el-col>
            <el-col :span="6" class="table-cell">-${{ order.couponAmount }}</el-col>
            <el-col :span="6" class="table-cell">-${{ order.integrationAmount }}</el-col>
          </el-row>
          <el-row>
            <el-col :span="6" class="table-cell-title">Promotion Discount</el-col>
            <el-col :span="6" class="table-cell-title">Discount Amount</el-col>
            <el-col :span="6" class="table-cell-title">Order Total</el-col>
            <el-col :span="6" class="table-cell-title">Amount Payable</el-col>
          </el-row>
          <el-row>
            <el-col :span="6" class="table-cell">-${{ order.promotionAmount }}</el-col>
            <el-col :span="6" class="table-cell">
              <el-input v-model.number="moneyInfo.discountAmount" size="mini"><template
                  slot="prepend">-$</template></el-input>
            </el-col>
            <el-col :span="6" class="table-cell">
              <span class="color-danger">${{ order.totalAmount + moneyInfo.freightAmount }}</span>
            </el-col>
            <el-col :span="6" class="table-cell">
              <span class="color-danger">${{ order.payAmount + moneyInfo.freightAmount - moneyInfo.discountAmount
              }}</span>
            </el-col>
          </el-row>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="moneyDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleUpdateMoneyInfo">Confirm</el-button>
        </span>
      </el-dialog>

      <el-dialog title="Send Internal Message" :visible.sync="messageDialogVisible" width="40%">
        <el-form :model="message" ref="receiverInfoForm" label-width="150px">
          <el-form-item label="Title:">
            <el-input v-model="message.title" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="Content:">
            <el-input v-model="message.content" type="textarea" rows="3"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="messageDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleSendMessage">Confirm</el-button>
        </span>
      </el-dialog>

      <el-dialog title="Close Order" :visible.sync="closeDialogVisible" width="40%">
        <el-form :model="closeInfo" label-width="150px">
          <el-form-item label="Operation Note:">
            <el-input v-model="closeInfo.note" type="textarea" rows="3"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleCloseOrder">Confirm</el-button>
        </span>
      </el-dialog>

      <el-dialog title="Mark Order" :visible.sync="markOrderDialogVisible" width="40%">
        <el-form :model="markInfo" label-width="150px">
          <el-form-item label="Operation Note:">
            <el-input v-model="markInfo.note" type="textarea" rows="3"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="markOrderDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleMarkOrder">Confirm</el-button>
        </span>
      </el-dialog>

      <logistics-dialog v-model="logisticsDialogVisible"></logistics-dialog>
    </template>

  </div>
</template>
<script>
import { getOrderDetail, updateReceiverInfo, updateMoneyInfo, closeOrder, updateOrderNote, deleteOrder } from '@/api/order';
import LogisticsDialog from '@/views/oms/order/components/logisticsDialog';
import { formatDate } from '@/utils/date';
import VDistpicker from 'v-distpicker';

const defaultReceiverInfo = {
  orderId: null,
  receiverName: null,
  receiverPhone: null,
  receiverPostCode: null,
  receiverDetailAddress: null,
  receiverProvince: null,
  receiverCity: null,
  receiverRegion: null,
  status: null
};

export default {
  name: 'orderDetail',
  components: { VDistpicker, LogisticsDialog },
  data() {
    return {
      id: null,
      order: {},
      receiverDialogVisible: false,
      receiverInfo: Object.assign({}, defaultReceiverInfo),
      moneyDialogVisible: false,
      moneyInfo: { orderId: null, freightAmount: 0, discountAmount: 0, status: null },
      messageDialogVisible: false,
      message: { title: null, content: null },
      closeDialogVisible: false,
      closeInfo: { note: null, id: null },
      markOrderDialogVisible: false,
      markInfo: { note: null },
      logisticsDialogVisible: false
    };
  },
  created() {
    this.id = this.list = this.$route.query.id;
    getOrderDetail(this.id).then(response => {
      this.order = response.data;
    });
  },
  filters: {
    formatNull(value) {
      return (value === undefined || value === null || value === '') ? 'None' : value;
    },
    formatLongText(value) {
      if (value === undefined || value === null || value === '') {
        return 'None';
      } else if (value.length > 8) {
        return value.substr(0, 8) + '...';
      } else {
        return value;
      }
    },
    formatPayType(value) {
      if (value === 1) return 'Alipay';
      if (value === 2) return 'WeChat';
      return 'Unpaid';
    },
    formatSourceType(value) {
      return value === 1 ? 'App Order' : 'PC Order';
    },
    formatOrderType(value) {
      return value === 1 ? 'Flash Sale Order' : 'Normal Order';
    },
    formatAddress(order) {
      let str = order.receiverProvince;
      if (order.receiverCity != null) str += " " + order.receiverCity;
      str += " " + order.receiverRegion;
      str += " " + order.receiverDetailAddress;
      return str;
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
    },
    formatPayStatus(value) {
      if (value === 0) return 'Unpaid';
      if (value === 4) return 'Refunded';
      return 'Paid';
    },
    formatDeliverStatus(value) {
      return (value === 0 || value === 1) ? 'Not Shipped' : 'Shipped';
    },
    formatProductAttr(value) {
      if (!value) return '';
      const attr = JSON.parse(value);
      return attr.map(a => `${a.key}:${a.value};`).join('');
    }
  },
  methods: {
    onSelectRegion(data) {
      this.receiverInfo.receiverProvince = data.province.value;
      this.receiverInfo.receiverCity = data.city.value;
      this.receiverInfo.receiverRegion = data.area.value;
    },
    formatTime(time) {
      if (!time) return '';
      return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss');
    },
    formatStepStatus(value) {
      if (value === 1) return 2; // Pending shipment
      if (value === 2) return 3; // Shipped
      if (value === 3) return 4; // Completed
      return 1; // Pending payment, Closed, or Invalid
    },
    showUpdateReceiverDialog() {
      this.receiverDialogVisible = true;
      this.receiverInfo = {
        orderId: this.order.id,
        receiverName: this.order.receiverName,
        receiverPhone: this.order.receiverPhone,
        receiverPostCode: this.order.receiverPostCode,
        receiverDetailAddress: this.order.receiverDetailAddress,
        receiverProvince: this.order.receiverProvince,
        receiverCity: this.order.receiverCity,
        receiverRegion: this.order.receiverRegion,
        status: this.order.status
      };
    },
    handleUpdateReceiverInfo() {
      this.$confirm('Do you want to update the receiver information?', 'Notice', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        updateReceiverInfo(this.receiverInfo).then(() => {
          this.receiverDialogVisible = false;
          this.$message({ type: 'success', message: 'Update successful!' });
          getOrderDetail(this.id).then(response => { this.order = response.data; });
        });
      });
    },
    showUpdateMoneyDialog() {
      this.moneyDialogVisible = true;
      this.moneyInfo.orderId = this.order.id;
      this.moneyInfo.freightAmount = this.order.freightAmount;
      this.moneyInfo.discountAmount = this.order.discountAmount;
      this.moneyInfo.status = this.order.status;
    },
    handleUpdateMoneyInfo() {
      this.$confirm('Do you want to update the cost information?', 'Notice', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        updateMoneyInfo(this.moneyInfo).then(() => {
          this.moneyDialogVisible = false;
          this.$message({ type: 'success', message: 'Update successful!' });
          getOrderDetail(this.id).then(response => { this.order = response.data; });
        });
      });
    },
    showMessageDialog() {
      this.messageDialogVisible = true;
      this.message.title = null;
      this.message.content = null;
    },
    handleSendMessage() {
      this.$confirm('Do you want to send the message?', 'Notice', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.messageDialogVisible = false;
        this.$message({ type: 'success', message: 'Message sent!' });
      });
    },
    showCloseOrderDialog() {
      this.closeDialogVisible = true;
      this.closeInfo.note = null;
      this.closeInfo.id = this.id;
    },
    handleCloseOrder() {
      this.$confirm('Do you want to close the order?', 'Notice', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams();
        params.append("ids", [this.closeInfo.id]);
        params.append("note", this.closeInfo.note);
        closeOrder(params).then(() => {
          this.closeDialogVisible = false;
          this.$message({ type: 'success', message: 'Order closed successfully!' });
          getOrderDetail(this.id).then(response => { this.order = response.data; });
        });
      });
    },
    showMarkOrderDialog() {
      this.markOrderDialogVisible = true;
      this.markInfo.id = this.id;
      this.closeOrder.note = null;
    },
    handleMarkOrder() {
      this.$confirm('Do you want to add a note to the order?', 'Notice', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams();
        params.append("id", this.markInfo.id);
        params.append("note", this.markInfo.note);
        params.append("status", this.order.status);
        updateOrderNote(params).then(() => {
          this.markOrderDialogVisible = false;
          this.$message({ type: 'success', message: 'Order note added successfully!' });
          getOrderDetail(this.id).then(response => { this.order = response.data; });
        });
      });
    },
    handleDeleteOrder() {
      this.$confirm('Do you want to perform this delete operation?', 'Notice', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams();
        params.append("ids", [this.id]);
        deleteOrder(params).then(() => {
          this.$message({ message: 'Deleted successfully!', type: 'success', duration: 1000 });
          this.$router.back();
        });
      });
    },
    showLogisticsDialog() {
      this.logisticsDialogVisible = true;
    }
  }
};
</script>

<style scoped>
.detail-container {
  width: 80%;
  padding: 20px;
  margin: 20px auto;
}

.operate-container {
  background: #F2F6FC;
  height: 80px;
  margin: -20px -20px 0;
  line-height: 80px;
}

.operate-button-container {
  float: right;
  margin-right: 20px;
}

.table-layout {
  margin-top: 20px;
  border-left: 1px solid #DCDFE6;
  border-top: 1px solid #DCDFE6;
}

.table-cell {
  height: 60px;
  line-height: 40px;
  border-right: 1px solid #DCDFE6;
  border-bottom: 1px solid #DCDFE6;
  padding: 10px;
  font-size: 14px;
  color: #606266;
  text-align: center;
  overflow: hidden;
}

.table-cell-title {
  border-right: 1px solid #DCDFE6;
  border-bottom: 1px solid #DCDFE6;
  padding: 10px;
  background: #F2F6FC;
  text-align: center;
  font-size: 14px;
  color: #303133;
}
</style>
