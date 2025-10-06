'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_API: '"http://localhost:8201/mall-admin"',
  // BASE_API: '"https://apis.darshanparbadiya.site/mall-admin"',
  VUE_APP_BASE_URL: '"http://localhost"',
  VUE_APP_MALL_MONITOR_PORT: '"8101"',
  VUE_APP_MALL_ADMIN: '"8080"',
  VUE_APP_MALL_PORTAL_PORT: '"8085"',
  VUE_APP_MALL_GATEWAY_PORT: '"8201"',
  VUE_APP_MALL_AUTH_PORT: '"8401"',
  VUE_APP_NACOS_PORT: '"8848"',
  VUE_APP_RABBITMQ_PORT: '"15672"'

})
