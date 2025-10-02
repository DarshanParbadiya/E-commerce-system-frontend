<template> 
  <el-card class="form-container" shadow="never">
    <el-form :model="coupon"
             :rules="rules"
             ref="couponForm"
             label-width="150px"
             size="small">
      <el-form-item label="Coupon Type:">
        <el-select v-model="coupon.type">
          <el-option
            v-for="type in typeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Coupon Name:" prop="name">
        <el-input v-model="coupon.name" class="input-width"></el-input>
      </el-form-item>
      <el-form-item label="Applicable Platform:">
        <el-select v-model="coupon.platform">
          <el-option
            v-for="item in platformOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Total Issued:" prop="publishCount">
        <el-input v-model.number="coupon.publishCount" placeholder="Only positive integers allowed" class="input-width"></el-input>
      </el-form-item>
      <el-form-item label="Face Value:" prop="amount">
        <el-input v-model.number="coupon.amount" placeholder="Value must be numeric, max 2 decimals" class="input-width">
          <template slot="append">USD</template>
        </el-input>
      </el-form-item>
      <el-form-item label="Limit per Person:">
        <el-input v-model="coupon.perLimit" placeholder="Only positive integers allowed" class="input-width">
          <template slot="append">coupons</template>
        </el-input>
      </el-form-item>
      <el-form-item label="Minimum Spend:" prop="minPoint">
        <el-input v-model.number="coupon.minPoint" placeholder="Only positive integers allowed" class="input-width">
          <template slot="prepend">Min</template>
          <template slot="append">USD</template>
        </el-input>
      </el-form-item>
      <el-form-item label="Claim Date:" prop="enableTime">
        <el-date-picker type="date" placeholder="Select date" v-model="coupon.enableTime" class="input-width"></el-date-picker>
      </el-form-item>
      <el-form-item label="Validity Period:">
        <el-date-picker type="date" placeholder="Select date" v-model="coupon.startTime" style="width: 150px"></el-date-picker>
        <span style="margin-left: 20px;margin-right: 20px">to</span>
        <el-date-picker type="date" placeholder="Select date" v-model="coupon.endTime" style="width: 150px"></el-date-picker>
      </el-form-item>
      <el-form-item label="Applicable Products:">
        <el-radio-group v-model="coupon.useType">
          <el-radio-button :label="0">All Products</el-radio-button>
          <el-radio-button :label="1">Specific Categories</el-radio-button>
          <el-radio-button :label="2">Specific Products</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="coupon.useType===1">
        <el-cascader
          clearable
          placeholder="Select category"
          v-model="selectProductCate"
          :options="productCateOptions">
        </el-cascader>
        <el-button @click="handleAddProductCategoryRelation()">Add</el-button>
        <el-table ref="productCateRelationTable"
                  :data="coupon.productCategoryRelationList"
                  style="width: 100%;margin-top: 20px"
                  border>
          <el-table-column label="Category Name" align="center">
            <template slot-scope="scope">{{scope.row.parentCategoryName}}>{{scope.row.productCategoryName}}</template>
          </el-table-column>
          <el-table-column label="Action" align="center" width="100">
            <template slot-scope="scope">
              <el-button size="mini"
                         type="text"
                         @click="handleDeleteProductCateRelation(scope.$index, scope.row)">Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item v-show="coupon.useType===2">
        <el-select
          v-model="selectProduct"
          filterable
          remote
          reserve-keyword
          placeholder="Product Name / SKU"
          :remote-method="searchProductMethod"
          :loading="selectProductLoading">
          <el-option
            v-for="item in selectProductOptions"
            :key="item.productId"
            :label="item.productName"
            :value="item.productId">
            <span style="float: left">{{ item.productName }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">NO.{{ item.productSn }}</span>
          </el-option>
        </el-select>
        <el-button @click="handleAddProductRelation()">Add</el-button>
        <el-table ref="productRelationTable"
                  :data="coupon.productRelationList"
                  style="width: 100%;margin-top: 20px"
                  border>
          <el-table-column label="Product Name" align="center">
            <template slot-scope="scope">{{scope.row.productName}}</template>
          </el-table-column>
          <el-table-column label="SKU" align="center"  width="120" >
            <template slot-scope="scope">NO.{{scope.row.productSn}}</template>
          </el-table-column>
          <el-table-column label="Action" align="center" width="100">
            <template slot-scope="scope">
              <el-button size="mini"
                         type="text"
                         @click="handleDeleteProductRelation(scope.$index, scope.row)">Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="Notes:">
        <el-input
          class="input-width"
          type="textarea"
          :rows="5"
          placeholder="Enter content"
          v-model="coupon.note">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('couponForm')">Submit</el-button>
        <el-button v-if="!isEdit" @click="resetForm('couponForm')">Reset</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
  import {createCoupon,getCoupon,updateCoupon} from '@/api/coupon';
  import {fetchSimpleList as fetchProductList} from '@/api/product';
  import {fetchListWithChildren} from '@/api/productCate'
  const defaultCoupon = {
    type: 0,
    name: null,
    platform: 0,
    amount: null,
    perLimit: 1,
    minPoint: null,
    startTime: null,
    endTime: null,
    useType: 0,
    note: null,
    publishCount: null,
    productRelationList: [],
    productCategoryRelationList: []
  };
  const defaultTypeOptions = [
    { label: 'Site-wide Coupon', value: 0 },
    { label: 'Member Coupon', value: 1 },
    { label: 'Shopping Coupon', value: 2 },
    { label: 'Registration Coupon', value: 3 }
  ];
  const defaultPlatformOptions = [
    { label: 'All Platforms', value: 0 },
    { label: 'Mobile', value: 1 },
    { label: 'PC', value: 2 }
  ];
  export default {
    name: 'CouponDetail',
    props: {
      isEdit: { type: Boolean, default: false }
    },
    data() {
      return {
        coupon: Object.assign({}, defaultCoupon),
        typeOptions: Object.assign({}, defaultTypeOptions),
        platformOptions: Object.assign({}, defaultPlatformOptions),
        rules: {
          name: [
            {required: true, message: 'Please enter coupon name', trigger: 'blur'},
            {min: 2, max: 140, message: 'Length must be 2-140 characters', trigger: 'blur'}
          ],
          publishCount: [
            {type: 'number',required: true, message: 'Only positive integers allowed', trigger: 'blur'}
          ],
          amount: [
            {type: 'number',required: true,message: 'Value must be numeric, 0.01-10000, max 2 decimals',trigger: 'blur'}
          ],
          minPoint: [
            {type: 'number',required: true,message: 'Only positive integers allowed',trigger: 'blur'}
          ]
        },
        selectProduct:null,
        selectProductLoading: false,
        selectProductOptions:[],
        selectProductCate: null,
        productCateOptions: []
      }
    },
    created(){
      if(this.isEdit){
        getCoupon(this.$route.query.id).then(response=>{
          this.coupon=response.data;
        });
      }
      this.getProductCateList();
    },
    methods:{
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$confirm('Do you want to submit the data?', 'Confirm', {
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              type: 'warning'
            }).then(() => {
              if(this.isEdit){
                updateCoupon(this.$route.query.id,this.coupon).then(response=>{
                  this.$refs[formName].resetFields();
                  this.$message({ message: 'Update successful', type: 'success', duration:1000 });
                  this.$router.back();
                });
              }else{
                createCoupon(this.coupon).then(response=>{
                  this.$refs[formName].resetFields();
                  this.$message({ message: 'Submission successful', type: 'success', duration:1000 });
                  this.$router.back();
                });
              }
            });
          } else {
            this.$message({ message: 'Validation failed', type: 'error', duration:1000 });
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.coupon = Object.assign({},defaultCoupon);
      },
      searchProductMethod(query){
        if (query !== '') {
          this.loading = true;
          fetchProductList({keyword:query}).then(response=>{
            this.loading=false;
            let productList = response.data;
            this.selectProductOptions = [];
            for(let i=0;i<productList.length;i++){
              let item = productList[i];
              this.selectProductOptions.push({productId:item.id,productName:item.name,productSn:item.productSn});
            }
          });
        } else {
          this.selectProductOptions = [];
        }
      },
      handleAddProductRelation(){
        if(this.selectProduct===null){
          this.$message({ message: 'Please select a product first', type: 'warning' });
          return
        }
        this.coupon.productRelationList.push(this.getProductById(this.selectProduct));
        this.selectProduct=null;
      },
      handleDeleteProductRelation(index,row){
        this.coupon.productRelationList.splice(index,1);
      },
      handleAddProductCategoryRelation(){
        if(this.selectProductCate===null||this.selectProductCate.length===0){
          this.$message({ message: 'Please select a product category first', type: 'warning' });
          return
        }
        this.coupon.productCategoryRelationList.push(this.getProductCateByIds(this.selectProductCate));
        this.selectProductCate=[];
      },
      handleDeleteProductCateRelation(index,row){
        this.coupon.productCategoryRelationList.splice(index,1);
      },
      getProductById(id){
        for(let i=0;i<this.selectProductOptions.length;i++){
          if(id===this.selectProductOptions[i].productId){
            return this.selectProductOptions[i];
          }
        }
        return null;
      },
      getProductCateList() {
        fetchListWithChildren().then(response => {
          let list = response.data;
          this.productCateOptions = [];
          for (let i = 0; i < list.length; i++) {
            let children = [];
            if (list[i].children != null && list[i].children.length > 0) {
              for (let j = 0; j < list[i].children.length; j++) {
                children.push({label: list[i].children[j].name, value: list[i].children[j].id});
              }
            }
            this.productCateOptions.push({label: list[i].name, value: list[i].id, children: children});
          }
        });
      },
      getProductCateByIds(ids){
        let name;
        let parentName;
        for (let i = 0; i < this.productCateOptions.length; i++) {
          if (this.productCateOptions[i].value === ids[0]) {
            parentName = this.productCateOptions[i].label;
            for (let j = 0; j < this.productCateOptions[i].children.length; j++) {
              if (this.productCateOptions[i].children[j].value === ids[1]) {
                name = this.productCateOptions[i].children[j].label;
              }
            }
          }
        }
        return {productCategoryId: ids[1], productCategoryName: name, parentCategoryName: parentName};
      }
    }
  }
</script>

<style scoped>
  .input-width {
    width: 60%;
  }
</style>
