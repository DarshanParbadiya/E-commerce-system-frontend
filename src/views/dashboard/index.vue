<template>
  <div class="docs-dashboard">
    <el-row :gutter="20" class="dashboard-header">
      <el-col :span="24">
        <h1>Mall Project Documentation Dashboard</h1>
        <p class="sub-title">
          Quick access to microservices, monitoring, and tools
        </p>
      </el-col>
    </el-row>
    <p>
      {{ $t('home.welcome.welcome') }}</p>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="service in services" :key="service.name">
        <el-card shadow="hover" class="service-card">
          <div class="card-header">
            <el-icon :name="service.icon" v-if="service.icon"></el-icon>
            <span class="card-title">{{ service.name }}</span>
          </div>
          <p class="card-desc">{{ service.description }}</p>
          <el-button type="primary" icon="el-icon-link" size="mini" @click="openLink(service.link)">
            Open
          </el-button>
          <el-button v-if="service.extraLink" type="success" icon="el-icon-document" size="mini"
            @click="openLink(service.extraLink)">
            Docs
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "ProjectDocsDashboard",


  data() {

    const base = process.env.VUE_APP_BASE_URL;
    const monitor = process.env.VUE_APP_MALL_MONITOR_PORT;
    const portal = process.env.VUE_APP_MALL_PORTAL_PORT;
    const gateway = process.env.VUE_APP_MALL_GATEWAY_PORT;
    const admin = process.env.VUE_APP_MALL_ADMIN;
    const auth = process.env.VUE_APP_MALL_AUTH_PORT;
    const nacos = process.env.VUE_APP_NACOS_PORT;
    const mq = process.env.VUE_APP_RABBITMQ_PORT;
    return {
      services: [
        {
          name: "Mall Monitor",
          description: "Spring Boot Admin dashboard for monitoring microservices.",
          link: `${base}:${monitor}/login#/`,
          icon: "monitor"
        },
        {
          name: "Mall Portal",
          description: "Swagger API documentation for the portal service.",
          link: `${base}:${portal}/swagger-ui/index.html#/`,
          icon: "document"
        },
        {
          name: "Mall Admin",
          description: "Swagger API documentation for the Admin service.",
          link: `${base}:${admin}/swagger-ui/index.html#/`,
          icon: "document"
        },
        {
          name: "Mall Gateway",
          description: "Main gateway for all services.",
          link: `${base}:${gateway}`,
          extraLink: `${base}:${gateway}/doc.html`,
          icon: "connection"
        },
        {
          name: "Mall Auth",
          description: "Authentication service with Swagger API docs.",
          link: `${base}:${auth}/swagger-ui/index.html#/`,
          icon: "lock"
        },
        {
          name: "Nacos Registry",
          description: "Configuration management center for microservices.",
          link: `${base}:${nacos}/nacos/`,
          icon: "setting"
        },
        {
          name: "RabbitMQ",
          description: "Message queue management interface.",
          link: `${base}:${mq}/`,
          icon: "message"
        }
      ]
    };
  },
  methods: {
    openLink(url) {
      window.open(url, "_blank");
    }
  }
};
</script>

<style scoped>
.docs-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 600;
}

.sub-title {
  color: #606266;
  font-size: 1rem;
}

.service-card {
  transition: transform 0.2s;
}

.service-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
}

.card-header .el-icon {
  font-size: 20px;
  margin-right: 0.5rem;
  color: #409EFF;
}

.card-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.card-desc {
  margin-bottom: 1rem;
  color: #606266;
}
</style>
