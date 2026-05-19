<script>
import { loadFigmaFontsFace } from '@/utils/load-figma-fonts.js'

export default {
	onLaunch: function () {
		loadFigmaFontsFace()
	},
	onShow: function () {},
	onHide: function () {}
}
</script>

<style lang="scss">
@import 'uview-plus/index.scss';
@import '@/styles/figma-my-fonts.scss';

/*每个页面公共css */
</style>
