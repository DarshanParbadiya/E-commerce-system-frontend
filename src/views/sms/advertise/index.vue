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
          <el-form-item label="Advertisement Name:">
            <el-input v-model="listQuery.name" class="input-width" placeholder="Advertisement Name"></el-input>
          </el-form-item>
          <el-form-item label="Advertisement Position:">
            <el-select v-model="listQuery.type" placeholder="All" clearable class="input-width">
              <el-option v-for="item in typeOptions"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Expiration Date:">
            <el-date-picker
              class="input-width"
              v-model="listQuery.endTime"
              value-format="yyyy-MM-dd"
              type="date"
              placeholder="Select Date">
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>Data List</span>
      <el-button size="mini" class="btn-add" @click="handleAdd()">Add Advertisement</el-button>
    </el-card>

    <div class="table-container">
      <el-table ref="homeAdvertiseTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="ID" width="120" align="center">
          <template slot-scope="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="Advertisement Name" align="center">
          <template slot-scope="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="Position" width="120" align="center">
          <template slot-scope="scope">{{scope.row.type | formatType}}</template>
        </el-table-column>
        <el-table-column label="Image" width="120" align="center">
          <template slot-scope="scope"><img style="height: 80px" :src="scope.row.pic"></template>
        </el-table-column>
        <el-table-column label="Time" width="220" align="center">
          <template slot-scope="scope">
            <p>Start: {{scope.row.startTime | formatTime}}</p>
            <p>End: {{scope.row.endTime | formatTime}}</p>
          </template>
        </el-table-column>
        <el-table-column label="Online/Offline" width="120" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleUpdateStatus(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Clicks" width="120" align="center">
          <template slot-scope="scope">{{scope.row.clickCount}}</template>
        </el-table-column>
        <el-table-column label="Orders Generated" width="120" align="center">
          <template slot-scope="scope">{{scope.row.orderCount}}</template>
        </el-table-column>
        <el-table-column label="Actions" width="120" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleUpdate(scope.$index, scope.row)">Edit
            </el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleDelete(scope.$index, scope.row)">Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="batch-operate-container">
      <el-select
        size="small"
        v-model="operateType" placeholder="Batch Operation">
        <el-option
          v-for="item in operates"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button
        style="margin-left: 20px"
        class="search-button"
        @click="handleBatchOperate()"
        type="primary"
        size="small">
        Confirm
      </el-button>
    </div>

    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
        :page-size="listQuery.pageSize"
        :page-sizes="[5,10,15]"
        :current-page.sync="listQuery.pageNum"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import { fetchList, updateStatus, deleteHomeAdvertise } from '@/api/homeAdvertise';
  import { formatDate } from '@/utils/date';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 5,
    name: null,
    type: null,
    endTime: null
  };

  const defaultTypeOptions = [
    { label: 'PC Homepage Carousel', value: 0 },
    { label: 'APP Homepage Carousel', value: 1 }
  ];

  export default {
    name: 'homeAdvertiseList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        typeOptions: Object.assign({}, defaultTypeOptions),
        list: null,
        total: null,
        listLoading: false,
        multipleSelection: [],
        operates: [
          { label: "Delete", value: 0 }
        ],
        operateType: null
      };
    },
    created() {
      this.getList();
    },
    filters: {
      formatType(type) {
        return type === 1 ? 'APP Homepage Carousel' : 'PC Homepage Carousel';
      },
      formatTime(time) {
        if (time == null || time === '') return 'N/A';
        const date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
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
      handleUpdateStatus(index, row) {
        this.$confirm('Do you want to change the Online/Offline status?', 'Confirmation', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id, { status: row.status }).then(() => {
            this.getList();
            this.$message({ type: 'success', message: 'Status updated successfully!' });
          });
        }).catch(() => {
          this.$message({ type: 'success', message: 'Operation canceled!' });
          this.getList();
        });
      },
      handleDelete(index, row) {
        this.deleteHomeAdvertise(row.id);
      },
      handleBatchOperate() {
        if (this.multipleSelection.length < 1) {
          this.$message({ message: 'Please select at least one record', type: 'warning', duration: 1000 });
          return;
        }
        const ids = this.multipleSelection.map(item => item.id);
        if (this.operateType === 0) {
          this.deleteHomeAdvertise(ids);
        } else {
          this.$message({ message: 'Please select a batch operation type', type: 'warning', duration: 1000 });
        }
      },
      handleAdd() {
        this.$router.push({ path: '/sms/addAdvertise' });
      },
      handleUpdate(index, row) {
        this.$router.push({ path: '/sms/updateAdvertise', query: { id: row.id } });
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      deleteHomeAdvertise(ids) {
        this.$confirm('Do you want to delete this advertisement?', 'Confirmation', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        }).then(() => {
          const params = new URLSearchParams();
          params.append("ids", ids);
          deleteHomeAdvertise(params).then(() => {
            this.getList();
            this.$message({ type: 'success', message: 'Deleted successfully!' });
          });
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

