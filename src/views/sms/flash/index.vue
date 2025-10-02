<template>
  <div class="app-container">
    <!-- Filter/Search -->
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>Filter Search</span>
        <el-button style="float:right" type="primary" @click="handleSearchList()" size="small">
          Search
        </el-button>
        <el-button style="float:right;margin-right: 15px" @click="handleResetSearch()" size="small">
          Reset
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="Event Name:">
            <el-input v-model="listQuery.keyword" class="input-width" placeholder="Event Name" clearable></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- Data List -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>Data List</span>
      <el-button size="mini" class="btn-add" @click="handleAdd()" style="margin-left: 20px">Add Event</el-button>
      <el-button size="mini" class="btn-add" @click="handleShowSessionList()">Flash Sale Time Slots</el-button>
    </el-card>

    <!-- Table -->
    <div class="table-container">
      <el-table ref="flashTable" :data="list" style="width: 100%;" v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="ID" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="Event Title" align="center">
          <template slot-scope="scope">{{ scope.row.title }}</template>
        </el-table-column>
        <el-table-column label="Event Status" width="140" align="center">
          <template slot-scope="scope">{{ scope.row | formatActiveStatus }}</template>
        </el-table-column>
        <el-table-column label="Start Time" width="140" align="center">
          <template slot-scope="scope">{{ scope.row.startDate | formatDate }}</template>
        </el-table-column>
        <el-table-column label="End Time" width="140" align="center">
          <template slot-scope="scope">{{ scope.row.endDate | formatDate }}</template>
        </el-table-column>
        <el-table-column label="Online/Offline" width="200" align="center">
          <template slot-scope="scope">
            <el-switch @change="handleStatusChange(scope.$index, scope.row)" :active-value="1" :inactive-value="0"
              v-model="scope.row.status">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="180" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="handleSelectSession(scope.$index, scope.row)">Set Products
            </el-button>
            <el-button size="mini" type="text" @click="handleUpdate(scope.$index, scope.row)">
              Edit
            </el-button>
            <el-button size="mini" type="text" @click="handleDelete(scope.$index, scope.row)">Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper" :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize" :page-sizes="[5, 10, 15]" :total="total">
      </el-pagination>
    </div>

    <!-- Add/Edit Dialog -->
    <el-dialog title="Add Event" :visible.sync="dialogVisible" width="40%">
      <el-form :model="flashPromotion" ref="flashPromotionForm" label-width="150px" size="small">
        <el-form-item label="Event Title:">
          <el-input v-model="flashPromotion.title" style="width: 250px"></el-input>
        </el-form-item>
        <el-form-item label="Start Time:">
          <el-date-picker v-model="flashPromotion.startDate" type="date" placeholder="Select Time">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="End Time:">
          <el-date-picker v-model="flashPromotion.endDate" type="date" placeholder="Select Time">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Online/Offline">
          <el-radio-group v-model="flashPromotion.status">
            <el-radio :label="1">Online</el-radio>
            <el-radio :label="0">Offline</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">Cancel</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchList, updateStatus, deleteFlash, createFlash, updateFlash} from '@/api/flash';
  import {formatDate} from '@/utils/date';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 5,
    keyword: null
  };
  const defaultFlashPromotion = {
    id: null,
    title: null,
    startDate: null,
    endDate: null,
    status: 0
  };
  export default {
    name: 'flashPromotionList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: false,
        dialogVisible: false,
        flashPromotion: Object.assign({}, defaultFlashPromotion),
        isEdit: false
      }
    },
    created() {
      this.getList();
    },
    filters: {
      formatActiveStatus(row) {
        let nowDate = new Date();
        let startDate = new Date(row.startDate);
        let endDate = new Date(row.endDate);
        if (nowDate.getTime() >= startDate.getTime() && nowDate.getTime() <= endDate.getTime()) {
          return 'Ongoing';
        } else if (nowDate.getTime() > endDate.getTime()) {
          return 'Ended';
        } else {
          return 'Not Started';
        }
      },
      formatDate(time) {
        if (time == null || time === '') {
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd')
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
        this.dialogVisible = true;
        this.isEdit = false;
        this.flashPromotion = Object.assign({},defaultFlashPromotion);
      },
      handleShowSessionList() {
        this.$router.push({path: '/sms/flashSession'})
      },
      handleStatusChange(index, row) {
        this.$confirm('Do you want to change this status?', 'Notice', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          updateStatus(row.id, {status: row.status}).then(response => {
            this.$message({
              type: 'success',
              message: 'Update successful!'
            });
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: 'Update cancelled'
          });
          this.getList();
        });
      },
      handleDelete(index, row) {
        this.$confirm('Do you want to delete this event?', 'Notice', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          deleteFlash(row.id).then(response => {
            this.$message({
              type: 'success',
              message: 'Deleted successfully!'
            });
            this.getList();
          });
        });
      },
      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.isEdit = true;
        this.flashPromotion = Object.assign({},row);
      },
      handleDialogConfirm() {
        this.$confirm('Are you sure?', 'Notice', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          if (this.isEdit) {
            updateFlash(this.flashPromotion.id,this.flashPromotion).then(response => {
              this.$message({
                message: 'Update successful!',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          } else {
            createFlash(this.flashPromotion).then(response => {
              this.$message({
                message: 'Added successfully!',
                type: 'success'
              });
              this.dialogVisible =false;
              this.getList();
            })
          }
        })
      },
      handleSelectSession(index,row){
        this.$router.push({path:'/sms/selectSession',query:{flashPromotionId:row.id}})
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
  }
</script>
<style></style>
