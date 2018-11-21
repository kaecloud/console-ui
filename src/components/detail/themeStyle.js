const COLOR_PRIMARY = '#3F51B5';
const COLOR_ACCENT = '#FF4081';
const COLOR_SUCCESS = '#4CAF50';
const COLOR_ERROR = "#E53935";
const COLOR_WARNING = '#FBC02D';
const COLOR_INFO = '#78909C';
const COLOR_DIVIDER = 'rgba(0, 0, 0, .12)';

const COLOR_PROC = '#9CCC65';
const COLOR_SERVICE = '#FF9800';
const COLOR_RESOURCE = '#9C27B0';

const ThemeStyles = {

    colors: {
      primary: COLOR_PRIMARY,
      accent: COLOR_ACCENT,
      success: COLOR_SUCCESS,
      warning: COLOR_WARNING,
      error: COLOR_ERROR,
      info: COLOR_INFO,
      divider: COLOR_DIVIDER,

      proc: COLOR_PROC,
      service: COLOR_SERVICE,
      resource: COLOR_RESOURCE
    },

    card: {
      width: '100%',
      marginBottom: 16,
      minHeight: 100
    },

    cardTitle: {
      color: "white",
      backgroundImage: `url(${window.assets['imgLogo']})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'bottom 8px right 15%',
      backgroundColor: `${COLOR_PRIMARY}`,
      height: 80
    },

    dataTable: {
      border: 'none',
      width: '100%',
      overflowX: 'auto',
    },

    colorStyle(color, isBackground = false) {
      return {
        [isBackground ? 'backgroundColor' : 'color']: this.colors[color],
      };
    },

    divider(position) {
      return {
        [position]: `1px solid ${COLOR_DIVIDER}`,
      }
    },

};

export default ThemeStyles;
