<template>
  <el-dialog title="Order Tracking"
             :visible.sync="visible"
             :before-close="handleClose"
             width="40%">
    <el-steps direction="vertical"
              :active="6"
              finish-status="success"
              space="50px">
      <el-step v-for="item in logisticsList"
               :key="item.name"
               :title="item.name"
               :description="item.time"></el-step>
    </el-steps>
  </el-dialog>
</template>

<script>
const defaultLogisticsList = [
  { name: 'Order submitted, awaiting payment', time: '2017-04-01 12:00:00' },
  { name: 'Payment successful', time: '2017-04-01 12:00:00' },
  { name: 'Scanned at a sub-location in Beijing, awaiting payment', time: '2017-04-01 12:00:00' },
  { name: 'Unloaded at Shenzhen distribution center, Guangdong, awaiting payment', time: '2017-04-01 12:00:00' },
  { name: 'Departed from Shenzhen company, Guangdong', time: '2017-04-01 12:00:00' },
  { name: 'Arrived at destination branch in Shenzhen, Guangdong; parcel will be delivered soon', time: '2017-04-01 12:00:00' },
  { name: 'Order delivered, looking forward to serving you again', time: '2017-04-01 12:00:00' }
];

export default {
  name: 'logisticsDialog',
  props: {
    value: Boolean
  },
  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(visible) {
        this.value = visible;
      }
    }
  },
  data() {
    return {
      logisticsList: Object.assign({}, defaultLogisticsList)
    }
  },
  methods: {
    emitInput(val) {
      this.$emit('input', val);
    },
    handleClose() {
      this.emitInput(false);
    }
  }
}
</script>

<style></style>
