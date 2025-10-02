<template>
  <el-card class="form-container" shadow="never">
    <div v-for="(cate, index) in allResourceCate" :class="index === 0 ? 'top-line' : null" :key="'cate' + cate.id">
      <el-row class="table-layout" style="background: #F2F6FC;">
        <el-checkbox v-model="cate.checked" :indeterminate="isIndeterminate(cate.id)"
          @change="handleCheckAllChange(cate)">
          {{ cate.name }}
        </el-checkbox>
      </el-row>
      <el-row class="table-layout">
        <el-col :span="8" v-for="resource in getResourceByCate(cate.id)" :key="resource.id" style="padding: 4px 0">
          <el-checkbox v-model="resource.checked" @change="handleCheckChange(resource)">
            {{ resource.name }}
          </el-checkbox>
        </el-col>
      </el-row>
    </div>
    <div style="margin-top: 20px" align="center">
      <el-button type="primary" @click="handleSave()">Save</el-button>
      <el-button @click="handleClear()">Clear</el-button>
    </div>
  </el-card>
</template>

<script>
import { fetchAllResourceList } from '@/api/resource';
import { listAllCate } from '@/api/resourceCategory';
import { allocResource, listResourceByRole } from '@/api/role';

export default {
  name: "allocResource",
  data() {
    return {
      roleId: null,
      allResource: null,
      allResourceCate: null
    };
  },
  created() {
    this.roleId = this.$route.query.roleId;
    this.getAllResourceCateList();
  },
  methods: {
    getAllResourceList() {
      fetchAllResourceList().then(response => {
        this.allResource = response.data;
        this.allResource.forEach(item => item.checked = false);
        this.getResourceByRole(this.roleId);
      });
    },
    getAllResourceCateList() {
      listAllCate().then(response => {
        this.allResourceCate = response.data;
        this.allResourceCate.forEach(item => item.checked = false);
        this.getAllResourceList();
      });
    },
    getResourceByCate(categoryId) {
      if (!this.allResource) return null;
      return this.allResource.filter(resource => resource.categoryId === categoryId);
    },
    getResourceByRole(roleId) {
      listResourceByRole(roleId).then(response => {
        const allocatedResources = response.data;
        this.allResource.forEach(item => {
          item.checked = this.isResourceChecked(item.id, allocatedResources);
        });
        this.allResourceCate.forEach(item => {
          item.checked = this.isAllChecked(item.id);
        });
        this.$forceUpdate();
      });
    },
    isResourceChecked(resourceId, allocatedResources) {
      if (!allocatedResources || allocatedResources.length === 0) return false;
      return allocatedResources.some(r => r.id === resourceId);
    },
    isIndeterminate(categoryId) {
      const cateResources = this.getResourceByCate(categoryId);
      if (!cateResources) return false;
      const checkedCount = cateResources.filter(r => r.checked).length;
      return !(checkedCount === 0 || checkedCount === cateResources.length);
    },
    isAllChecked(categoryId) {
      const cateResources = this.getResourceByCate(categoryId);
      if (!cateResources) return false;
      const checkedCount = cateResources.filter(r => r.checked).length;
      return checkedCount > 0 && checkedCount === cateResources.length;
    },
    handleSave() {
      this.$confirm('Do you want to assign resources?', 'Prompt', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        const checkedResourceIds = new Set(
          this.allResource.filter(item => item.checked).map(item => item.id)
        );
        const params = new URLSearchParams();
        params.append("roleId", this.roleId);
        params.append("resourceIds", Array.from(checkedResourceIds));
        allocResource(params).then(() => {
          this.$message({
            message: 'Resources assigned successfully',
            type: 'success',
            duration: 1000
          });
          this.$router.back();
        });
      });
    },
    handleClear() {
      this.allResourceCate.forEach(item => item.checked = false);
      this.allResource.forEach(item => item.checked = false);
      this.$forceUpdate();
    },
    handleCheckAllChange(cate) {
      const cateResources = this.getResourceByCate(cate.id);
      cateResources.forEach(resource => resource.checked = cate.checked);
      this.$forceUpdate();
    },
    handleCheckChange(resource) {
      this.allResourceCate.forEach(item => {
        if (item.id === resource.categoryId) {
          item.checked = this.isAllChecked(resource.categoryId);
        }
      });
      this.$forceUpdate();
    }
  }
}
</script>

<style scoped>
.table-layout {
  padding: 20px;
  border-left: 1px solid #DCDFE6;
  border-right: 1px solid #DCDFE6;
  border-bottom: 1px solid #DCDFE6;
}

.top-line {
  border-top: 1px solid #DCDFE6;
}
</style>
