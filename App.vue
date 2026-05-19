<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { loadFigmaFontsFace } from '@/utils/load-figma-fonts.js'
import { useRulesStore } from '@/store/rules.js'

onLaunch(() => {
  loadFigmaFontsFace()
  useRulesStore()
    .fetchActiveEnvTags()
    .catch(() => {})
})
</script>

<style lang="scss">
@import 'uview-plus/index.scss';
@import '@/styles/figma-my-fonts.scss';

/*每个页面公共css */
</style>

