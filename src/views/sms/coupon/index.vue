<template> 
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>Filter Search</span>
        <el-button
          style="float:right"
          type="primary"
          @click="handleSearchList()"
          size="small">
          Search
        </el-button>
        <el-button
          style="float:right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          Reset
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="Coupon Name:">
            <el-input v-model="listQuery.name" class="input-width" placeholder="Coupon Name"></el-input>
          </el-form-item>
          <el-form-item label="Coupon Type:">
            <el-select v-model="listQuery.type" placeholder="All" clearable class="input-width">
              <el-option v-for="item in typeOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>Data List</span>
      <el-button size="mini" class="btn-add" @click="handleAdd()">Add</el-button>
    </el-card>

    <div class="table-container">
      <el-table ref="couponTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="ID" width="100" align="center">
          <template slot-scope="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="Coupon Name" align="center">
          <template slot-scope="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="Coupon Type" width="100" align="center">
          <template slot-scope="scope">{{scope.row.type | formatType}}</template>
        </el-table-column>
        <el-table-column label="Applicable Products" width="100" align="center">
          <template slot-scope="scope">{{scope.row.useType | formatUseType}}</template>
        </el-table-column>
        <el-table-column label="Minimum Requirement" width="140" align="center">
          <template slot-scope="scope">Valid on orders over {{scope.row.minPoint}} currency units</template>
        </el-table-column>
        <el-table-column label="Value" width="100" align="center">
          <template slot-scope="scope">{{scope.row.amount}} currency units</template>
        </el-table-column>
        <el-table-column label="Platform" width="100" align="center">
          <template slot-scope="scope">{{scope.row.platform | formatPlatform}}</template>
        </el-table-column>
        <el-table-column label="Validity" width="180" align="center">
          <template slot-scope="scope">{{scope.row.startTime|formatDate}} to {{scope.row.endTime|formatDate}}</template>
        </el-table-column>
        <el-table-column label="Status" width="100" align="center">
          <template slot-scope="scope">{{scope.row.endTime | formatStatus}}</template>
        </el-table-column>
        <el-table-column label="Actions" width="180" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleView(scope.$index, scope.row)">View</el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleUpdate(scope.$index, scope.row)">Edit</el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleDelete(scope.$index, scope.row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
        :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize"
        :page-sizes="[5,10,15]"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { fetchList, deleteCoupon } from '@/api/coupon';
import { formatDate } from '@/utils/date';

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  name: null,
  type: null
};

const defaultTypeOptions = [
  { label: 'Sitewide Coupon', value: 0 },
  { label: 'Member Coupon', value: 1 },
  { label: 'Shopping Coupon', value: 2 },
  { label: 'Registration Coupon', value: 3 }
];

export default {
  name: 'couponList',
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      typeOptions: Object.assign({}, defaultTypeOptions),
      list: null,
      total: null,
      listLoading: false,
      multipleSelection: []
    };
  },
  created() {
    this.getList();
  },
   filters:{
      formatType(type){
        for(let i=0;i<defaultTypeOptions.length;i++){
          if(type===defaultTypeOptions[i].value){
            return defaultTypeOptions[i].label;
          }
        }
        return '';
      },
    formatUseType(useType) {
      if (useType === 0) return 'Universal';
      else if (useType === 1) return 'Specific Category';
      else return 'Specific Product';
    },
    formatPlatform(platform) {
      if (platform === 1) return 'Mobile';
      else if (platform === 2) return 'PC';
      else return 'All Platforms';
    },
    formatDate(time) {
      if (!time) return 'N/A';
      return formatDate(new Date(time), 'yyyy-MM-dd');
    },
    formatStatus(endTime) {
      const now = new Date().getTime();
      return new Date(endTime) > now ? 'Active' : 'Expired';
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
    handleSizeChange(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleAdd() {
      this.$router.push({ path: '/sms/addCoupon' });
    },
    handleView(index, row) {
      this.$router.push({ path: '/sms/couponHistory', query: { id: row.id } });
    },
    handleUpdate(index, row) {
      this.$router.push({ path: '/sms/updateCoupon', query: { id: row.id } });
    },
    handleDelete(index, row) {
      this.$confirm('Do you want to delete this item?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }).then(() => {
        deleteCoupon(row.id).then(() => {
          this.$message({ type: 'success', message: 'Deleted successfully!' });
          this.getList();
        });
      });
    },
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        this.listLoading = false;
        this.list = response.data.list;
        this.total = response.data.total;
      });
    }
  }
};
</script>

<style scoped>
.input-width {
  width: 203px;
}
</style>
