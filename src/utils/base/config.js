/**
 * Created by tandajun on 2017/4/27.
 * 配置不同环境变量下Protocol IP Port
 */
export const Protocal = 'http'
export const IP = '127.0.0.1'
export const Port = 8080
export const Context = "/cloudrecord-web"

/**
 * 全局环境变量
 */
export const Environment = {
  esn: false,
  mobile: false,
  view: true
}

/**
 * 后台服务接口的地址
 * @type {{Protocal: string, IP: string, Port: number}}
 */
export const Develop = {
    Protocal,
    IP,
    Port,
    Context
}

/**
 * 后台服务的接口
 * @type {{Protocal: string, IP: string, Port: string}}
 */
export const Release = {
    Protocal: 'http',
    IP: 'nwltcwglzxtsjk.hads.tax',
    Port: 8080,
    Context
}

export const Mock = {
    Protocal: 'http',
    IP: '10.11.66.71',
    Port: 8080,
    Context
}
