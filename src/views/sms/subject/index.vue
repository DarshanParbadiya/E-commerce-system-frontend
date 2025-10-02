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
          <el-form-item label="Subject Name:">
            <el-input v-model="listQuery.subjectName" class="input-width" placeholder="Subject Name"></el-input>
          </el-form-item>
          <el-form-item label="Recommendation Status:">
            <el-select v-model="listQuery.recommendStatus" placeholder="All" clearable class="input-width">
              <el-option v-for="item in recommendOptions"
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
      <el-button size="mini" class="btn-add" @click="handleSelectSubject()">Select Subject</el-button>
    </el-card>

    <div class="table-container">
      <el-table ref="newSubjectTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionChange"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="ID" width="120" align="center">
          <template slot-scope="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="Subject Name" align="center">
          <template slot-scope="scope">{{scope.row.subjectName}}</template>
        </el-table-column>
        <el-table-column label="Recommended?" width="200" align="center">
          <template slot-scope="scope">
            <el-switch
              @change="handleRecommendStatusStatusChange(scope.$index, scope.row)"
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.recommendStatus">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Sort Order" width="160" align="center">
          <template slot-scope="scope">{{scope.row.sort}}</template>
        </el-table-column>
        <el-table-column label="Status" width="160" align="center">
          <template slot-scope="scope">{{scope.row.recommendStatus | formatRecommendStatus}}</template>
        </el-table-column>
        <el-table-column label="Actions" width="180" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleEditSort(scope.$index, scope.row)">Set Sort
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

    <el-dialog title="Select Subject" :visible.sync="selectDialogVisible" width="50%">
      <el-input v-model="dialogData.listQuery.keyword"
                style="width: 250px;margin-bottom: 20px"
                size="small"
                placeholder="Search Subject Name">
        <el-button slot="append" icon="el-icon-search" @click="handleSelectSearch()"></el-button>
      </el-input>
      <el-table :data="dialogData.list"
                @selection-change="handleDialogSelectionChange" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="Subject Name" align="center">
          <template slot-scope="scope">{{scope.row.title}}</template>
        </el-table-column>
        <el-table-column label="Category" width="160" align="center">
          <template slot-scope="scope">{{scope.row.categoryName}}</template>
        </el-table-column>
        <el-table-column label="Created At" width="160" align="center">
          <template slot-scope="scope">{{scope.row.createTime | formatTime}}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleDialogSizeChange"
          @current-change="handleDialogCurrentChange"
          layout="prev, pager, next"
          :current-page.sync="dialogData.listQuery.pageNum"
          :page-size="dialogData.listQuery.pageSize"
          :page-sizes="[5,10,15]"
          :total="dialogData.total">
        </el-pagination>
      </div>

      <div style="clear: both;"></div>
      <div slot="footer">
        <el-button size="small" @click="selectDialogVisible = false">Cancel</el-button>
        <el-button size="small" type="primary" @click="handleSelectDialogConfirm()">Confirm</el-button>
      </div>
    </el-dialog>

    <el-dialog title="Set Sort Order"
               :visible.sync="sortDialogVisible"
               width="40%">
      <el-form :model="sortDialogData"
               label-width="150px">
        <el-form-item label="Sort Order:">
          <el-input v-model="sortDialogData.sort" style="width: 200px"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="sortDialogVisible = false" size="small">Cancel</el-button>
        <el-button type="primary" @click="handleUpdateSort" size="small">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { fetchList, updateRecommendStatus, deleteHomeSubject, createHomeSubject, updateHomeSubjectSort } from '@/api/homeSubject';
  import { fetchList as fetchSubjectList } from '@/api/subject';
  import { formatDate } from '@/utils/date';

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 5,
    subjectName: null,
    recommendStatus: null
  };

  const defaultRecommendOptions = [
    { label: 'Not Recommended', value: 0 },
    { label: 'Recommended', value: 1 }
  ];

  export default {
    name: 'homeSubjectList',
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        recommendOptions: Object.assign({}, defaultRecommendOptions),
        list: null,
        total: null,
        listLoading: false,
        multipleSelection: [],
        operates: [
          { label: "Set as Recommended", value: 0 },
          { label: "Cancel Recommendation", value: 1 },
          { label: "Delete", value: 2 }
        ],
        operateType: null,
        selectDialogVisible: false,
        dialogData: {
          list: null,
          total: null,
          multipleSelection: [],
          listQuery: { keyword: null, pageNum: 1, pageSize: 5 }
        },
        sortDialogVisible: false,
        sortDialogData: { sort: 0, id: null }
      };
    },
    created() {
      this.getList();
    },
    filters: {
      formatRecommendStatus(status) {
        return status === 1 ? 'Recommended' : 'Not Recommended';
      },
      formatTime(time) {
        if (time == null || time === '') return 'N/A';
        return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss');
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
      handleRecommendStatusStatusChange(index, row) {
        this.updateRecommendStatusStatus(row.id, row.recommendStatus);
      },
      handleDelete(index, row) {
        this.deleteSubject(row.id);
      },
      handleBatchOperate() {
        if (this.multipleSelection.length < 1) {
          this.$message({ message: 'Please select at least one record', type: 'warning', duration: 1000 });
          return;
        }
        const ids = this.multipleSelection.map(item => item.id);
        if (this.operateType === 0) {
          this.updateRecommendStatusStatus(ids, 1);
        } else if (this.operateType === 1) {
          this.updateRecommendStatusStatus(ids, 0);
        } else if (this.operateType === 2) {
          this.deleteSubject(ids);
        } else {
          this.$message({ message: 'Please select a batch operation type', type: 'warning', duration: 1000 });
        }
      },
      handleSelectSubject() {
        this.selectDialogVisible = true;
        this.dialogData.listQuery.keyword = null;
        this.getDialogList();
      },
      handleSelectSearch() {
        this.getDialogList();
      },
      handleDialogSizeChange(val) {
        this.dialogData.listQuery.pageNum = 1;
        this.dialogData.listQuery.pageSize = val;
        this.getDialogList();
      },
      handleDialogCurrentChange(val) {
        this.dialogData.listQuery.pageNum = val;
        this.getDialogList();
      },
      handleDialogSelectionChange(val) {
        this.dialogData.multipleSelection = val;
      },
      handleSelectDialogConfirm() {
        if (this.dialogData.multipleSelection.length < 1) {
          this.$message({ message: 'Please select at least one record', type: 'warning', duration: 1000 });
          return;
        }
        const selectSubjects = this.dialogData.multipleSelection.map(item => ({
          subjectId: item.id,
          subjectName: item.title
        }));
        this.$confirm('Do you want to add the selected subjects?', 'Confirmation', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        }).then(() => {
          createHomeSubject(selectSubjects).then(() => {
            this.selectDialogVisible = false;
            this.dialogData.multipleSelection = [];
            this.getList();
            this.$message({ type: 'success', message: 'Added successfully!' });
          });
        });
      },
      handleEditSort(index, row) {
        this.sortDialogVisible = true;
        this.sortDialogData.sort = row.sort;
        this.sortDialogData.id = row.id;
      },
      handleUpdateSort() {
        this.$confirm('Do you want to update the sort order?', 'Confirmation', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        }).then(() => {
          updateHomeSubjectSort(this.sortDialogData).then(() => {
            this.sortDialogVisible = false;
            this.getList();
            this.$message({ type: 'success', message: 'Updated successfully!' });
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
      },
      updateRecommendStatusStatus(ids, status) {
        this.$confirm('Do you want to change the recommendation status?', 'Confirmation', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        }).then(() => {
          const params = new URLSearchParams();
          params.append("ids", ids);
          params.append("recommendStatus", status);
          updateRecommendStatus(params).then(() => {
            this.getList();
            this.$message({ type: 'success', message: 'Updated successfully!' });
          });
        }).catch(() => {
          this.$message({ type: 'success', message: 'Operation canceled!' });
          this.getList();
        });
      },
      deleteSubject(ids) {
        this.$confirm('Do you want to delete this recommendation?', 'Confirmation', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        }).then(() => {
          const params = new URLSearchParams();
          params.append("ids", ids);
          deleteHomeSubject(params).then(() => {
            this.getList();
            this.$message({ type: 'success', message: 'Deleted successfully!' });
          });
        });
      },
      getDialogList() {
        fetchSubjectList(this.dialogData.listQuery).then(response => {
          this.dialogData.list = response.data.list;
          this.dialogData.total = response.data.total;
        });
      }
    }
  };
</script>

<style></style>
