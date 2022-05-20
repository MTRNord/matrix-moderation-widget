import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import { WidgetApi } from 'matrix-widget-api';
import {
  CANONICAL_ALIAS,
  DEV_NORDGEDANKEN_MJOLNIR_BANLISTS,
  M_POLICY_RULE_ROOM,
  M_POLICY_RULE_ROOM_ALT,
  M_POLICY_RULE_ROOM_OLD,
  M_POLICY_RULE_SERVER,
  M_POLICY_RULE_SERVER_ALT,
  M_POLICY_RULE_SERVER_OLD,
  M_POLICY_RULE_USER,
  M_POLICY_RULE_USER_ALT,
  M_POLICY_RULE_USER_OLD,
  M_ROOM_MEMBER,
  M_TEXT,
  ORG_MATRIX_MJOLNIR_SHORTCODE,
} from './windowExt';

const urlParams = (new URL(window.location.href)).searchParams;
const widgetId = urlParams.get("widgetId") ?? undefined;
window.widget_api = new WidgetApi(widgetId);
window.widget_api.requestCapabilityToReceiveState(M_POLICY_RULE_USER);
window.widget_api.requestCapabilityToReceiveState(M_POLICY_RULE_SERVER);
window.widget_api.requestCapabilityToReceiveState(M_POLICY_RULE_ROOM);
window.widget_api.requestCapabilityToReceiveState(M_POLICY_RULE_USER_OLD);
window.widget_api.requestCapabilityToReceiveState(M_POLICY_RULE_SERVER_OLD);
window.widget_api.requestCapabilityToReceiveState(M_POLICY_RULE_ROOM_OLD);
window.widget_api.requestCapabilityToReceiveState(M_POLICY_RULE_USER_ALT);
window.widget_api.requestCapabilityToReceiveState(M_POLICY_RULE_SERVER_ALT);
window.widget_api.requestCapabilityToReceiveState(M_POLICY_RULE_ROOM_ALT);
window.widget_api.requestCapabilityToReceiveState(CANONICAL_ALIAS);
window.widget_api.requestCapabilityToReceiveState(ORG_MATRIX_MJOLNIR_SHORTCODE);
window.widget_api.requestCapabilityToSendMessage(M_TEXT);
window.widget_api.requestCapabilityToReceiveState(M_ROOM_MEMBER);
window.widget_api.requestCapabilityToReceiveState(DEV_NORDGEDANKEN_MJOLNIR_BANLISTS);
// TODO maybe figure out the proper way later
window.widget_api.requestCapabilityForRoomTimeline("*");

window.widget_api.on(`ready`, () => {
  const container = document.querySelector('#root');
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});

// Start the messaging
window.widget_api.start();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
