/**
 * Created by APP on 2017/6/8.
 */

/*密级*/
let secretLevel = [
  {
    label: '限制',
    value: '1'
  },
  {
    label: '秘密',
    value: '2'
  },
  {
    label: '机密',
    value: '3'
  },
  {
    label: '绝密',
    value: '4'
  }
];

let secretLevelObj = {
  1: '限制',
  2: '秘密',
  3: '机密',
  4: '绝密'
};

/*来源类型*/
let srcType = [
  {
    label: '接口同步',
    value: '1'
  },
  {
    label: '手工采集',
    value: '2'
  }
];

let srcTypeObj = {
  1: '接口同步',
  2: '手工采集',
};

/*储存形式*/
let storeType = [
  {
    label: '电子+纸质',
    value: '1'
  },
  {
    label: '电子',
    value: '2'
  },
  {
    label: '纸质',
    value: '3'
  }
];

let storeTypeObj = {
  1: '电子+纸质',
  2: '电子',
  3: '纸质'
};

let approveStatus = [
  {
    label: '待审批',
    value: '10'
  },
  {
    label: '已审批',
    value: '20'
  },
  {
    label: '驳回',
    value: '30'
  },
  {
    label: '过期',
    value: '40'
  },
];

let approveStatusObj = {
  10: '待审批',
  20: '已审批',
  30: '驳回',
  40: '过期',
};

let turnoverType = [
  {
    label: '对内移交',
    value: '10'
  },
  {
    label: '对外移交',
    value: '20'
  }
];

let turnoverTypeObj = {
  10: '对内移交',
  20: '对外移交',
};
export {
  storeType,
  srcType,
  secretLevel,
  turnoverType,
  approveStatus,

  storeTypeObj,
  srcTypeObj,
  secretLevelObj,
  turnoverTypeObj,
  approveStatusObj,
}
// export default {
//   storeType,
//   srcType,
//   secretLevel,

//   storeTypeObj,
//   srcTypeObj,
//   secretLevelObj
// }