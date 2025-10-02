<template>
  <el-card class="form-container" shadow="never">
    <el-form :model="orderSetting"
             ref="orderSettingForm"
             :rules="rules"
             label-width="150px">
      <el-form-item label="Flash Sale Order Timeout:" prop="flashOrderOvertime">
        <el-input v-model="orderSetting.flashOrderOvertime" class="input-width">
          <template slot="append">minutes</template>
        </el-input>
        <span class="note-margin">Unpaid orders will be automatically closed</span>
      </el-form-item>
      
      <el-form-item label="Normal Order Timeout:" prop="normalOrderOvertime">
        <el-input v-model="orderSetting.normalOrderOvertime" class="input-width">
          <template slot="append">minutes</template>
        </el-input>
        <span class="note-margin">Unpaid orders will be automatically closed</span>
      </el-form-item>
      
      <el-form-item label="Delivery Timeout:" prop="confirmOvertime">
        <el-input v-model="orderSetting.confirmOvertime" class="input-width">
          <template slot="append">days</template>
        </el-input>
        <span class="note-margin">Unreceived orders will be automatically completed</span>
      </el-form-item>
      
      <el-form-item label="Order Completion Timeout:" prop="finishOvertime">
        <el-input v-model="orderSetting.finishOvertime" class="input-width">
          <template slot="append">days</template>
        </el-input>
        <span class="note-margin">Automatically close transaction; after this, no after-sales service allowed</span>
      </el-form-item>
      
      <el-form-item label="Order Review Timeout:" prop="commentOvertime">
        <el-input v-model="orderSetting.commentOvertime" class="input-width">
          <template slot="append">days</template>
        </el-input>
        <span class="note-margin">Automatically give a five-star review</span>
      </el-form-item>
      
      <el-form-item>
        <el-button
          @click="confirm('orderSettingForm')"
          type="primary">Submit</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { getOrderSetting, updateOrderSetting } from '@/api/orderSetting';

const defaultOrderSetting = {
  id: null,
  flashOrderOvertime: 0,
  normalOrderOvertime: 0,
  confirmOvertime: 0,
  finishOvertime: 0,
  commentOvertime: 0
};

const checkTime = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('Time cannot be empty'));
  }
  const intValue = parseInt(value);
  if (!Number.isInteger(intValue)) {
    return callback(new Error('Please enter a numeric value'));
  }
  callback();
};

export default {
  name: 'orderSetting',
  data() {
    return {
      orderSetting: Object.assign({}, defaultOrderSetting),
      rules: {
        flashOrderOvertime: { validator: checkTime, trigger: 'blur' },
        normalOrderOvertime: { validator: checkTime, trigger: 'blur' },
        confirmOvertime: { validator: checkTime, trigger: 'blur' },
        finishOvertime: { validator: checkTime, trigger: 'blur' },
        commentOvertime: { validator: checkTime, trigger: 'blur' }
      }
    }
  },
  created() {
    this.getDetail();
  },
  methods: {
    confirm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$confirm('Do you want to submit the changes?', 'Confirmation', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            updateOrderSetting(1, this.orderSetting).then(() => {
              this.$message({
                type: 'success',
                message: 'Submission successful!',
                duration: 1000
              });
            });
          });
        } else {
          this.$message({
            message: 'Invalid submission parameters',
            type: 'warning'
          });
          return false;
        }
      });
    },
    getDetail() {
      getOrderSetting(1).then(response => {
        this.orderSetting = response.data;
      });
    }
  }
}
</script>

<style scoped>
.input-width {
  width: 50%;
}

.note-margin {
  margin-left: 15px;
}
</style>
