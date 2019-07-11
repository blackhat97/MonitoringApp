export const environment = {
  production: true,

  url: 'http://iot.dymeter.com:3000/api',
  username: 'username',
  jwt_token: 'jwt_token',
  company_id: 'company_id',
  user_id: 'user_id',
  //sensor_id: 'sensor_id',
  channel_toggles: 'channel_toggles',
  actions: 'actions',

  msg_ok: '정상 측정 중입니다.',
  msg_network_error: '통신불량입니다.',
  msg_correction: '교정 중입니다.',
  msg_replace: '교체 중입니다.',
  msg_trouble: '센서/계측기에 문제가 생겼습니다.',
  msg_clean: '세척 중입니다.',

  msg_range_off: '접점 발생',
};
