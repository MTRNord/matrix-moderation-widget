import { WidgetApi } from "matrix-widget-api";

declare global {
    interface Window { widget_api: WidgetApi; }
}

export const M_POLICY_RULE_USER = "m.policy.rule.user";
export const M_POLICY_RULE_SERVER = "m.policy.rule.server";
export const M_POLICY_RULE_USER_OLD = "org.matrix.mjolnir.rule.user";
export const M_POLICY_RULE_SERVER_OLD = "org.matrix.mjolnir.rule.server";
export const M_POLICY_RULE_USER_ALT = "m.room.rule.user";
export const M_POLICY_RULE_SERVER_ALT = "m.room.rule.server";
export type UserRuleEvent = {
    sender: string;
    state_key: string;
    event_id: string;
    room_id: string;
    content?: {
        entity: string;
        reason: string;
        recommendation: string;
    };
};

export type ServerRuleEvent = {
    sender: string;
    state_key: string;
    event_id: string;
    room_id: string;
    content?: {
        entity: string;
        reason: string;
        recommendation: string;
    };
};

export type MembershipEvent = {
    sender: string;
    state_key: string;
    event_id: string;
    room_id: string;
    content?: {
        membership: string;
        reason?: string;
        avatar_url?: string;
        displayname?: string;
    };
};