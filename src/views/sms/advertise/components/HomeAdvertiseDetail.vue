<template> 
  <el-card class="form-container" shadow="never">
    <el-form :model="homeAdvertise"
             :rules="rules"
             ref="homeAdvertiseForm"
             label-width="150px"
             size="small">
      <el-form-item label="Advert Name:" prop="name">
        <el-input v-model="homeAdvertise.name" class="input-width"></el-input>
      </el-form-item>

      <el-form-item label="Advert Position:">
        <el-select v-model="homeAdvertise.type">
          <el-option
            v-for="type in typeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Start Time:" prop="startTime">
        <el-date-picker
          type="datetime"
          placeholder="Select Date"
          v-model="homeAdvertise.startTime"></el-date-picker>
      </el-form-item>

      <el-form-item label="End Time:" prop="endTime">
        <el-date-picker
          type="datetime"
          placeholder="Select Date"
          v-model="homeAdvertise.endTime"></el-date-picker>
      </el-form-item>

      <el-form-item label="Status:">
        <el-radio-group v-model="homeAdvertise.status">
          <el-radio :label="0">Offline</el-radio>
          <el-radio :label="1">Online</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Advert Image:">
        <single-upload v-model="homeAdvertise.pic"></single-upload>
      </el-form-item>

      <el-form-item label="Sort Order:">
        <el-input v-model="homeAdvertise.sort" class="input-width"></el-input>
      </el-form-item>

      <el-form-item label="Advert URL:" prop="url">
        <el-input v-model="homeAdvertise.url" class="input-width"></el-input>
      </el-form-item>

      <el-form-item label="Advert Note:">
        <el-input
          class="input-width"
          type="textarea"
          :rows="5"
          placeholder="Enter content"
          v-model="homeAdvertise.note">
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit('homeAdvertiseForm')">Submit</el-button>
        <el-button v-if="!isEdit" @click="resetForm('homeAdvertiseForm')">Reset</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
  import SingleUpload from '@/components/Upload/singleUpload';
  import { createHomeAdvertise, getHomeAdvertise, updateHomeAdvertise } from '@/api/homeAdvertise';

  const defaultTypeOptions = [
    { label: 'PC Homepage Carousel', value: 0 },
    { label: 'APP Homepage Carousel', value: 1 }
  ];

  const defaultHomeAdvertise = {
    name: null,
    type: 1,
    pic: null,
    startTime: null,
    endTime: null,
    status: 0,
    url: null,
    note: null,
    sort: 0
  };

  export default {
    name: 'HomeAdvertiseDetail',
    components: { SingleUpload },
    props: {
      isEdit: { type: Boolean, default: false }
    },
    data() {
      return {
        homeAdvertise: null,
        rules: {
          name: [
            { required: true, message: 'Please enter the advert name', trigger: 'blur' },
            { min: 2, max: 140, message: 'Length must be between 2 and 140 characters', trigger: 'blur' }
          ],
          url: [
            { required: true, message: 'Please enter the advert URL', trigger: 'blur' }
          ],
          startTime: [
            { required: true, message: 'Please select start time', trigger: 'blur' }
          ],
          endTime: [
            { required: true, message: 'Please select end time', trigger: 'blur' }
          ],
          pic: [
            { required: true, message: 'Please select an advert image', trigger: 'blur' }
          ]
        },
        typeOptions: Object.assign({}, defaultTypeOptions)
      };
    },
    created() {
      if (this.isEdit) {
        getHomeAdvertise(this.$route.query.id).then(response => {
          this.homeAdvertise = response.data;
        });
      } else {
        this.homeAdvertise = Object.assign({}, defaultHomeAdvertise);
      }
    },
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.$confirm('Do you want to submit the data?', 'Confirmation', {
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              type: 'warning'
            }).then(() => {
              if (this.isEdit) {
                updateHomeAdvertise(this.$route.query.id, this.homeAdvertise).then(() => {
                  this.$refs[formName].resetFields();
                  this.$message({ message: 'Updated successfully', type: 'success', duration: 1000 });
                  this.$router.back();
                });
              } else {
                createHomeAdvertise(this.homeAdvertise).then(() => {
                  this.$refs[formName].resetFields();
                  this.homeAdvertise = Object.assign({}, defaultHomeAdvertise);
                  this.$message({ message: 'Submitted successfully', type: 'success', duration: 1000 });
                });
              }
            });
          } else {
            this.$message({ message: 'Validation failed', type: 'error', duration: 1000 });
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.homeAdvertise = Object.assign({}, defaultHomeAdvertise);
      }
    }
  };
</script>

<style scoped>
  .input-width {
    width: 70%;
  }
</style>
