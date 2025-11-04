// 📁 src/Common/ToastAlert.js
export const AlertMesg = [
  {
    // 🔴 Default (Error or Warning Toast)
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    textColor: '#FFFFFF',
    position: 'bottom',
    statusBarType: 'light-content',
    timing: 3000,
    duration: 3000,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
  },
  {
    // 🟢 Success Toast
    backgroundColor: 'rgba(46, 204, 113, 0.95)', // soft green
    textColor: '#FFFFFF',
    position: 'bottom',
    statusBarType: 'light-content',
    timing: 3000,
    duration: 3000,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
  },
];
