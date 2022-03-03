import { PureComponent } from 'react';
import {
    CanonicalAliasEvent,
    CANONICAL_ALIAS,
    DEV_NORDGEDANKEN_MJOLNIR_BANLISTS,
    MembershipEvent,
    MJjolnirBanlists,
    M_POLICY_RULE_SERVER,
    M_POLICY_RULE_SERVER_ALT,
    M_POLICY_RULE_SERVER_OLD,
    M_POLICY_RULE_USER,
    M_POLICY_RULE_USER_ALT,
    M_POLICY_RULE_USER_OLD,
    ServerRuleEvent,
    UserRuleEvent
} from '../windowExt';

type Props = Record<string, unknown>;
type State = {
    user_rules: UserRuleEvent[];
    server_rules: ServerRuleEvent[];
    roomId?: string;
    filter?: string;
    memberships: MembershipEvent[];
};

class BanList extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        const urlParams = (new URL(window.location.href)).searchParams;
        const roomId = urlParams.get("room_id") ?? undefined;
        this.state = {
            roomId: roomId,
            user_rules: [],
            server_rules: [],
            memberships: []
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
        const list_rooms = [...new Set([...user_rules_all.map(element => element.room_id), ...server_rules_all.map(element => element.room_id)])];
        const sender = new Set([...user_rules_all.map(element => element.sender), ...server_rules_all.map(element => element.sender)]);
        const memberships = await window.widget_api.readStateEvents("m.room.member", 250_000_000_000, undefined, list_rooms) as MembershipEvent[];
        const memberships_needed = memberships.filter(member => sender.has(member.state_key));
        const banlist_codes = await window.widget_api.readStateEvents(DEV_NORDGEDANKEN_MJOLNIR_BANLISTS, 250_000_000_000, undefined, [this.state.roomId ?? "*"]) as MJjolnirBanlists[];
        const aliases = await window.widget_api.readStateEvents(CANONICAL_ALIAS, list_rooms.length, undefined, list_rooms) as CanonicalAliasEvent[];

        this.setState({
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
            memberships: memberships_needed
        });
    }

    onSearch(ev: { target: { value: string; }; }) {
        this.setState({
            filter: ev.target.value
        });
    }

    render() {
        const { user_rules, server_rules, filter, memberships } = this.state;
        const filtered_user_rules = filter ? user_rules.filter(element => element.content && Object.keys(element.content).length > 0 && element.content?.entity.includes(filter)) : user_rules;
        const filtered_server_rules = filter ? server_rules.filter(element => element.content && Object.keys(element.content).length > 0 && element.content?.entity.includes(filter)) : server_rules;
        return (
            <main className="m-8 flex items-center flex-col justify-center">
                <div className='flex flex-row justify-between content-between w-full'>
                    <h1 className="text-3xl font-bold underline text-gray-900 dark:text-gray-200 mb-4">Banlist data</h1>
                    <input onChange={this.onSearch.bind(this)} value={filter} placeholder="Search for user or server" className='py-1.5 px-2 rounded border-none placeholder:text-gray-900 text-gray-9000'></input>
                </div>
                <div className='flex flex-row justify-between content-between w-full'>
                    <section className='mr-2'>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">User Bans ({user_rules.length})</h3>
                        <table className='table-auto border-collapse border-2 border-slate-500 text-gray-900 dark:text-gray-200 text-base font-normal break-words w-full'>
                            <thead>
                                <tr>
                                    <th className='border-2 border-slate-600 p-1'>Entity</th>
                                    <th className='border-2 border-slate-600 p-1'>Recommendation</th>
                                    <th className='border-2 border-slate-600 p-1'>Reason</th>
                                    <th className='border-2 border-slate-600 p-1'>Sender</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filtered_user_rules.length > 0 ?
                                        filtered_user_rules.map(element => {
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
                    </section>
                    <section>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">Server Bans ({server_rules.length})</h3>
                        <table className='table-auto border-collapse border-2 border-slate-500 text-gray-900 dark:text-gray-200 text-base font-normal break-words w-full'>
                            <thead>
                                <tr>
                                    <th className='border-2 border-slate-600 p-2'>Entity</th>
                                    <th className='border-2 border-slate-600 p-2'>Recommendation</th>
                                    <th className='border-2 border-slate-600 p-2'>Reason</th>
                                    <th className='border-2 border-slate-600 p-1'>Sender</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filtered_server_rules.length > 0 ?
                                        filtered_server_rules.map(element => {
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
                                                    </tr>
                                                );
                                            }
                                        }) : (
                                            <tr className='border-2 border-slate-600'>
                                                <td className='p-1'>No server ban found</td>
                                            </tr>
                                        )
                                }
                            </tbody>
                        </table>
                    </section>
                </div>
            </main>
        );
    }
}

export default BanList;