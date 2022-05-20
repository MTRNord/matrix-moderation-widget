import { PureComponent } from 'react';
import {
    CanonicalAliasEvent,
    CANONICAL_ALIAS,
    DEV_NORDGEDANKEN_MJOLNIR_BANLISTS,
    MembershipEvent,
    MJjolnirBanlists,
    M_POLICY_RULE_ROOM,
    M_POLICY_RULE_ROOM_ALT,
    M_POLICY_RULE_ROOM_OLD,
    M_POLICY_RULE_SERVER,
    M_POLICY_RULE_SERVER_ALT,
    M_POLICY_RULE_SERVER_OLD,
    M_POLICY_RULE_USER,
    M_POLICY_RULE_USER_ALT,
    M_POLICY_RULE_USER_OLD,
    RuleEvent
} from '../windowExt';

type Props = Record<string, unknown>;
type State = {
    user_rules: RuleEvent[];
    server_rules: RuleEvent[];
    room_rules: RuleEvent[];
    roomId?: string;
    filter?: string;
    memberships: MembershipEvent[];
    bantype: "user" | "server" | "room";
    aliases: CanonicalAliasEvent[];
};

class BanList extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        const urlParams = (new URL(window.location.href)).searchParams;
        const roomId = urlParams.get("room_id") ?? undefined;
        this.state = {
            bantype: "user",
            roomId: roomId,
            user_rules: [],
            server_rules: [],
            room_rules: [],
            memberships: [],
            aliases:[]
        };
    }

    async componentDidMount() {
        const user_rules = await window.widget_api.readStateEvents(M_POLICY_RULE_USER, 250_000_000_000, undefined, ["*"]) as RuleEvent[];
        const server_rules = await window.widget_api.readStateEvents(M_POLICY_RULE_SERVER, 250_000_000_000, undefined, ["*"]) as RuleEvent[];
        const room_rules = await window.widget_api.readStateEvents(M_POLICY_RULE_ROOM, 250_000_000_000, undefined, ["*"]) as RuleEvent[];
        const user_rules_old = await window.widget_api.readStateEvents(M_POLICY_RULE_USER_OLD, 250_000_000_000, undefined, ["*"]) as RuleEvent[];
        const server_rules_old = await window.widget_api.readStateEvents(M_POLICY_RULE_SERVER_OLD, 250_000_000_000, undefined, ["*"]) as RuleEvent[];
        const room_rules_old = await window.widget_api.readStateEvents(M_POLICY_RULE_ROOM_OLD, 250_000_000_000, undefined, ["*"]) as RuleEvent[];
        const user_rules_alt = await window.widget_api.readStateEvents(M_POLICY_RULE_USER_ALT, 250_000_000_000, undefined, ["*"]) as RuleEvent[];
        const server_rules_alt = await window.widget_api.readStateEvents(M_POLICY_RULE_SERVER_ALT, 250_000_000_000, undefined, ["*"]) as RuleEvent[];
        const room_rules_alt = await window.widget_api.readStateEvents(M_POLICY_RULE_ROOM_ALT, 250_000_000_000, undefined, ["*"]) as RuleEvent[];
        const user_rules_all = [...user_rules, ...user_rules_old, ...user_rules_alt];
        const server_rules_all = [...server_rules, ...server_rules_old, ...server_rules_alt];
        const room_rules_all = [...room_rules, ...room_rules_old, ...room_rules_alt];
        const list_rooms = [...new Set([...user_rules_all.map(element => element.room_id), ...server_rules_all.map(element => element.room_id)])];
        const sender = new Set([...user_rules_all.map(element => element.sender), ...server_rules_all.map(element => element.sender)]);
        const memberships = await window.widget_api.readStateEvents("m.room.member", 250_000_000_000, undefined, list_rooms) as MembershipEvent[];
        const memberships_needed = memberships.filter(member => sender.has(member.state_key));
        const banlist_codes = await window.widget_api.readStateEvents(DEV_NORDGEDANKEN_MJOLNIR_BANLISTS, 250_000_000_000, undefined, [this.state.roomId ?? "*"]) as MJjolnirBanlists[];
        const aliases = await window.widget_api.readStateEvents(CANONICAL_ALIAS, list_rooms.length, undefined, list_rooms) as CanonicalAliasEvent[];

        this.setState({
            aliases,
            user_rules: user_rules_all.filter(rules => {
                if (banlist_codes.length > 0) {
                    return banlist_codes.some(banlist_codes_event => ((aliases.find(aliases_event => aliases_event.room_id === rules.room_id)?.content?.alias ?? "") in (banlist_codes_event.content?.banlists ?? {})) || (rules.room_id in (banlist_codes_event.content?.banlists ?? {})));
                } else {
                    return true;
                }
            }),
            server_rules: server_rules_all.filter(rules => {
                if (banlist_codes.length > 0) {
                    return banlist_codes.some(banlist_codes_event => ((aliases.find(aliases_event => aliases_event.room_id === rules.room_id)?.content?.alias ?? "") in (banlist_codes_event.content?.banlists ?? {})) || (rules.room_id in (banlist_codes_event.content?.banlists ?? {})));
                } else {
                    return true;
                }
            }),
            room_rules: room_rules_all.filter(rules => {
                if (banlist_codes.length > 0) {
                    return banlist_codes.some(banlist_codes_event => ((aliases.find(aliases_event => aliases_event.room_id === rules.room_id)?.content?.alias ?? "") in (banlist_codes_event.content?.banlists ?? {})) || (rules.room_id in (banlist_codes_event.content?.banlists ?? {})));
                } else {
                    return true;
                }
            }),
            memberships: memberships_needed
        });
    }

    onSearch(ev: { target: { value: string; }; }) {
        this.setState({
            filter: ev.target.value
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

    render() {
        const { user_rules, server_rules, filter, memberships, bantype, room_rules,aliases } = this.state;
        const filtered_user_rules = filter ? user_rules.filter(element => element.content && Object.keys(element.content).length > 0 && element.content?.entity.includes(filter)) : user_rules;
        const filtered_server_rules = filter ? server_rules.filter(element => element.content && Object.keys(element.content).length > 0 && element.content?.entity.includes(filter)) : server_rules;
        const filtered_room_rules = filter ? room_rules.filter(element => element.content && Object.keys(element.content).length > 0 && element.content?.entity.includes(filter)) : room_rules;

        const rules = bantype === "user" ? filtered_user_rules : (bantype === "server" ? filtered_server_rules : filtered_room_rules);
        return (
            <main className="m-8 flex items-start flex-col">
                <div className='flex flex-row justify-between content-between w-full'>
                    <h1 className="text-3xl font-bold underline text-gray-900 dark:text-gray-200 mb-4">Banlist data</h1>
                    <div className='flex flex-row'>
                        <select required defaultValue="" name="bantype" value={bantype} className="placeholder:text-gray-900 text-gray-900 rounded py-1.5 px-2" onChange={this.handleInputChange.bind(this)}>
                            <option value="" disabled>Select an Bantype</option>
                            <option value="user">User</option>
                            <option value="server">Server</option>
                            <option value="room">Room</option>
                        </select>
                        <input onChange={this.onSearch.bind(this)} value={filter} placeholder="Search for user or server" className='ml-2 py-1.5 px-2 rounded border-none placeholder:text-gray-900 text-gray-9000'></input>
                    </div>
                </div>
                <div className='flex flex-row w-full mb-4'>
                    <h5 className="text-lg font-medium text-gray-900 dark:text-gray-200 mr-2">User Bans ({user_rules.length})</h5>
                    <h5 className="text-lg font-medium text-gray-900 dark:text-gray-200 mx-2">Server Bans ({server_rules.length})</h5>
                    <h5 className="text-lg font-medium text-gray-900 dark:text-gray-200 mx-2">Room Bans ({room_rules.length})</h5>
                </div>
                <div className='flex flex-row w-full mb-4'>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200">{bantype === "room" ? "Room Bans" : (bantype === "server" ? "Server Bans" : "User Bans")}</h3>
                </div>
                <div className='flex flex-row justify-between content-between w-full'>
                    <table className='p-16 table-auto border-collapse border-2 border-slate-500 text-gray-900 dark:text-gray-200 text-base font-normal break-words w-full'>
                        <thead>
                            <tr>
                                <th className='border-2 border-slate-600 p-1'>Entity</th>
                                <th className='border-2 border-slate-600 p-1'>Recommendation</th>
                                <th className='border-2 border-slate-600 p-1'>Reason</th>
                                <th className='border-2 border-slate-600 p-1'>Sender</th>
                                <th className='border-2 border-slate-600 p-1'>Room</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                rules.length > 0 ?
                                    rules.map(element => {
                                        if (element.content && Object.keys(element.content).length > 0) {
                                            const recommendation = element.content.recommendation === "m.ban" || element.content.recommendation === "org.matrix.mjolnir.ban" ? "Ban" : element.content.recommendation;

                                            // Entity is intentionally left as a mxid
                                            const sender_dp = memberships.find(membership => membership.state_key === element.sender)?.content?.displayname ?? element.sender;
                                            return (
                                                <tr key={`${element.event_id}`} className='border-2 border-slate-600'>
                                                    <td className='p-1 min-w-[8rem] max-w-[14rem]'>{element.content.entity}</td>
                                                    <td className='p-1 min-w-[1rem] max-w-[14rem]'>{recommendation}</td>
                                                    <td className='p-1 min-w-[8rem] max-w-[14rem]'>{element.content.reason}</td>
                                                    <td className='p-1 min-w-[12rem] max-w-[14rem]'>{sender_dp}</td>
                                                    <td className='p-1 min-w-[12rem] max-w-[14rem]'>{aliases.find(aliases_event => aliases_event.room_id === element.room_id)?.content?.alias ?? element.room_id}</td>
                                                </tr>
                                            );
                                        }
                                    }) : (
                                        <tr className='border-2 border-slate-600'>
                                            <td className='p-1'>No user ban found</td>
                                        </tr>
                                    )
                            }
                        </tbody>
                    </table>
                </div>
            </main>
        );
    }
}

export default BanList;