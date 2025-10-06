<template>
  <div class="lang-switcher">
    <el-dropdown trigger="click" @command="switchLang">
      <div class="lang-wrapper">
        <span>{{ currentLangLabel }}</span>
        <i class="el-icon-caret-bottom"></i>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="lang in languages"
          :key="lang.code"
          :command="lang.code"
        >
          {{ lang.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: "LanguageSwitcher",
  data() {
    return {
      languages: [
        { code: "en", label: "English" },
        { code: "zh", label: "中文" },
         {code:"fr",label:"fr"}
      ]
    }
  },
  computed: {
    currentLangLabel() {
      const current = this.languages.find(
        (lang) => lang.code === this.$i18n.locale
      )
      return current ? current.label : "Language"
    }
  },
  methods: {
    switchLang(lang) {
      this.$i18n.locale = lang
      localStorage.setItem("locale", lang)
    }
  },
  created() {
    const savedLang = localStorage.getItem("locale")
    if (savedLang) {
      this.$i18n.locale = savedLang
    }
  }
}
</script>

<style scoped>
.lang-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.lang-wrapper span {
  margin-right: 5px;
}
</style>
