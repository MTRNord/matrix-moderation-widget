import { PureComponent } from "react";
import {
    CanonicalAliasEvent,
    CANONICAL_ALIAS,
    M_POLICY_RULE_SERVER,
    M_POLICY_RULE_SERVER_ALT,
    M_POLICY_RULE_SERVER_OLD,
    M_POLICY_RULE_USER,
    M_POLICY_RULE_USER_ALT,
    M_POLICY_RULE_USER_OLD,
    ORG_MATRIX_MJOLNIR_SHORTCODE,
    ServerRuleEvent,
    ShortcodeEvent,
    UserRuleEvent
} from "../windowExt";

type Props = Record<string, unknown>;
type State = {
    glob: string;
    reason: string;
    roomId?: string;
    aliases_shortcodes: Map<string, string>;
    banlist?: string;
    bantype?: "user" | "server";
};

class BanForm extends PureComponent<Props, State> {
    constructor(props: Props | Readonly<Props>) {
        super(props);
        const urlParams = (new URL(window.location.href)).searchParams;
        const roomId = urlParams.get("room_id") ?? undefined;
        this.state = {
            glob: "",
            reason: "",
            roomId: roomId,
            aliases_shortcodes: new Map()
        };
    }

    async componentDidMount() {
        const user_rules = await window.widget_api.readStateEvents(M_POLICY_RULE_USER, 250_000_000_000, undefined, ["*"]) as UserRuleEvent[];
        const server_rules = await window.widget_api.readStateEvents(M_POLICY_RULE_SERVER, 250_000_000_000, undefined, ["*"]) as ServerRuleEvent[];
        const user_rules_old = await window.widget_api.readStateEvents(M_POLICY_RULE_USER_OLD, 250_000_000_000, undefined, ["*"]) as UserRuleEvent[];
        const server_rules_old = await window.widget_api.readStateEvents(M_POLICY_RULE_SERVER_OLD, 250_000_000_000, undefined, ["*"]) as ServerRuleEvent[];
        const user_rules_alt = await window.widget_api.readStateEvents(M_POLICY_RULE_USER_ALT, 250_000_000_000, undefined, ["*"]) as UserRuleEvent[];
        const server_rules_alt = await window.widget_api.readStateEvents(M_POLICY_RULE_SERVER_ALT, 250_000_000_000, undefined, ["*"]) as ServerRuleEvent[];
        const user_rules_all = [...user_rules, ...user_rules_old, ...user_rules_alt];
        const server_rules_all = [...server_rules, ...server_rules_old, ...server_rules_alt];
        const listrooms = [...new Set([...user_rules_all.map(element => element.room_id), ...server_rules_all.map(element => element.room_id)])];
        const aliases = await window.widget_api.readStateEvents(CANONICAL_ALIAS, listrooms.length, undefined, listrooms) as CanonicalAliasEvent[];
        const shortcodes = await window.widget_api.readStateEvents(ORG_MATRIX_MJOLNIR_SHORTCODE, listrooms.length, undefined, listrooms) as ShortcodeEvent[];
        const aliases_shortcodes = new Map();

        for (const event of aliases) {
            if (event.content?.alias) {
                aliases_shortcodes.set(event.content?.alias, shortcodes.find(shortcode_event => shortcode_event.room_id === event.room_id)?.content?.shortcode);
            }
        }

        this.setState({
            aliases_shortcodes
        });
    }

    handleInputChange(event: { target: { type: string, checked?: boolean, value: string | boolean, name: string; }; }) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        } as unknown as State);
    }

    async handleSubmit(ev: { preventDefault: () => void; }) {
        ev.preventDefault();
        await window.widget_api.sendRoomEvent("m.room.message", {
            msgtype: "m.text",
            body: `!mjolnir ban ${this.state.banlist} ${this.state.bantype} ${this.state.glob} ${this.state.reason}`,
        }, this.state.roomId);
    }

    render() {
        const { glob, banlist, aliases_shortcodes, bantype, reason } = this.state;
        return (
            <>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">Ban</h3>
                <form onSubmit={this.handleSubmit.bind(this)} className="grid grid-cols-1 gap-4">
                    <label className="inner-flex flex-col">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Bantype</span>
                        <h4 className="text-gray-900 dark:text-gray-200 text-base font-thin mb-2 w-96 italic">(Warning: This doesn't check if the banlist can be written to or the bot if watches it)</h4>
                        <div className="w-96">
                            <select required name="banlist" value={banlist ?? ""} className="max-w-full min-w-full placeholder:text-gray-900 text-gray-900 rounded py-1.5 px-2" onChange={this.handleInputChange.bind(this)}>
                                <option value="" disabled>Select an Banlist</option>
                                {
                                    [...aliases_shortcodes].map(([alias, shortcode]) => {
                                        return <option key={alias} value={shortcode}>{alias}</option>;
                                    })
                                }
                            </select>
                        </div>
                    </label>
                    <label className="inner-flex flex-col w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Bantype</span>
                        <div className="w-96">
                            <select defaultValue="" required name="bantype" value={bantype ?? ""} className="max-w-full min-w-full placeholder:text-gray-900 text-gray-900 rounded py-1.5 px-2" onChange={this.handleInputChange.bind(this)}>
                                <option value="" disabled>Select an Bantype</option>
                                <option value="user">User</option>
                                <option value="server">Server</option>
                            </select>
                        </div>
                    </label>
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Glob</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input placeholder="Glob" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="glob" value={glob} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Reason</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input placeholder="Reason" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="reason" value={reason} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>

                    <input className="bg-red-400 hover:bg-red-500 cursor-pointer h-10 rounded dark:text-gray-900 text-gray-200 w-96" type="submit" value="Ban" />
                </form>
            </>
        );
    }
}

export default BanForm;