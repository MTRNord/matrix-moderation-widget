import { PureComponent } from 'react';
import {
    CanonicalAliasEvent,
    CANONICAL_ALIAS,
    M_POLICY_RULE_SERVER,
    M_POLICY_RULE_SERVER_ALT,
    M_POLICY_RULE_SERVER_OLD,
    M_POLICY_RULE_USER,
    M_POLICY_RULE_USER_ALT,
    M_POLICY_RULE_USER_OLD,
    ServerRuleEvent,
    ShortcodeEvent,
    UserRuleEvent
} from '../windowExt';

type Props = Record<string, unknown>;
type State = {
    mxid?: string;
    roomId?: string;
    aliases_shortcodes: Map<string, string>;
    banlist?: string;
};
class Home extends PureComponent<Props, State> {
    constructor(props: Props | Readonly<Props>) {
        super(props);
        const urlParams = (new URL(window.location.href)).searchParams;
        const roomId = urlParams.get("room_id") ?? undefined;
        this.state = {
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
        const shortcodes = await window.widget_api.readStateEvents(CANONICAL_ALIAS, listrooms.length, undefined, listrooms) as ShortcodeEvent[];
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

    async handleSubmit() {
        await window.widget_api.sendRoomEvent("m.room.message", {
            msgtype: "m.text",
            body: "widget test",
        }, this.state.roomId);
    }

    render() {
        const { mxid, banlist, aliases_shortcodes } = this.state;
        return (
            <main className="m-8">
                <h1 className="text-3xl font-bold underline text-gray-900 dark:text-gray-200 mb-4">Home</h1>
                <div className='flex flex-col'>
                    <section>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">Ban user</h3>
                        <form onSubmit={this.handleSubmit.bind(this)} className="grid grid-cols-1 gap-6">
                            <label className="inner-flex flex-col">
                                <span className="text-xl text-gray-900 dark:text-gray-200 font-bold py-2">Banlist (warning this doesnt check if the banlist can be written to or the bot watches it)</span>
                                <div className="w-96">
                                    <select defaultValue="" required name="banlist" value={banlist ?? ""} className="max-w-full placeholder:text-gray-900 text-gray-900 rounded py-1.5 px-2" onChange={this.handleInputChange.bind(this)}>
                                        <option value="" disabled>Select an Banlist</option>
                                        {
                                            [...aliases_shortcodes].map(([alias, shortcode]) => {
                                                return <option value={shortcode}>{alias}</option>;
                                            })
                                        }
                                    </select>
                                </div>
                            </label>
                            <label className="block w-96">
                                <span className="text-gray-900 dark:text-gray-200 visually-hidden py-2">MXID</span>
                                <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300">
                                    <input placeholder="MXID" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="mxid" value={mxid} onChange={this.handleInputChange} />
                                </div>
                            </label>

                            <input className="bg-red-400 hover:bg-red-500 cursor-pointer h-10 rounded dark:text-gray-900 text-gray-200  w-96" type="submit" value="Ban User" />
                        </form>
                    </section>
                </div>
            </main>
        );
    }
}

export default Home;