/**
 * Created by APP on 2017/4/25.
 * 打开新标签页时，将sessionStorage中的共享到新标签页
 */
// 为了简单明了删除了对IE的支持
(function () {

    if (!sessionStorage.length) {
        // 这个调用能触发目标事件，从而达到共享数据的目的
        localStorage.setItem('getSessionStorage', Date.now());
    }

    // 该事件是核心
    window.addEventListener('storage', function (event) {
        if (event.key == 'getSessionStorage') {
            // 已存在的标签页会收到这个事件
            localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
            localStorage.removeItem('sessionStorage');

        } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
            // 新开启的标签页会收到这个事件
            let data = JSON.parse(event.newValue);

            //指定需要保存在sessionStorage中的key
            for (let key in data) {
                if(key == 'user' || key == 'jsessionid'){
                    sessionStorage.setItem(key, data[key]);
                }
            }
        }
    });
})();