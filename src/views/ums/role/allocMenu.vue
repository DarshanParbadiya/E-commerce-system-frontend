<template>
  <el-card class="form-container" shadow="never">
    <el-tree :data="menuTreeList" show-checkbox default-expand-all node-key="id" ref="tree" highlight-current
      :props="defaultProps">
    </el-tree>
    <div style="margin-top: 20px" align="center">
      <el-button type="primary" @click="handleSave()">Save</el-button>
      <el-button @click="handleClear()">Clear</el-button>
    </div>
  </el-card>
</template>

<script>
import { fetchTreeList } from '@/api/menu';
import { listMenuByRole, allocMenu } from '@/api/role';

export default {
  name: "allocMenu",
  data() {
    return {
      menuTreeList: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      roleId: null
    };
  },
  created() {
    this.roleId = this.$route.query.roleId;
    this.loadTreeList();
    this.loadRoleMenu(this.roleId);
  },
  methods: {
    loadTreeList() {
      fetchTreeList().then(response => {
        this.menuTreeList = response.data;
      });
    },
    loadRoleMenu(roleId) {
      listMenuByRole(roleId).then(response => {
        const menuList = response.data;
        let checkedMenuIds = [];
        if (menuList != null && menuList.length > 0) {
          menuList.forEach(menu => {
            if (menu.parentId !== 0) {
              checkedMenuIds.push(menu.id);
            }
          });
        }
        this.$refs.tree.setCheckedKeys(checkedMenuIds);
      });
    },
    handleSave() {
      const checkedNodes = this.$refs.tree.getCheckedNodes();
      let checkedMenuIds = new Set();
      if (checkedNodes != null && checkedNodes.length > 0) {
        checkedNodes.forEach(node => {
          checkedMenuIds.add(node.id);
          if (node.parentId !== 0) {
            checkedMenuIds.add(node.parentId);
          }
        });
      }
      this.$confirm('Do you want to allocate these menus?', 'Prompt', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        let params = new URLSearchParams();
        params.append("roleId", this.roleId);
        params.append("menuIds", Array.from(checkedMenuIds));
        allocMenu(params).then(() => {
          this.$message({
            message: 'Menus allocated successfully',
            type: 'success',
            duration: 1000
          });
          this.$router.back();
        });
      });
    },
    handleClear() {
      this.$refs.tree.setCheckedKeys([]);
    }
  }
}
</script>

<style scoped></style>
