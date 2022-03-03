import { PureComponent } from "react";
import { DEV_NORDGEDANKEN_MJOLNIR_BANLISTS, MJjolnirBanlists, M_ROOM_MEMBER, M_ROOM_POWERLEVELS } from "../../windowExt";
type Props = Record<string, unknown>;
type State = {
    room: string;
    roomId?: string;
    user_id: string;
};
class NewRoomForm extends PureComponent<Props, State> {
    constructor(props: Props | Readonly<Props>) {
        super(props);
        const urlParams = (new URL(window.location.href)).searchParams;
        const roomId = urlParams.get("room_id") ?? undefined;
        this.state = {
            room: "",
            roomId: roomId,
            user_id: ""
        };
    }

    async componentDidMount() {
        // TODO use to get the bot if available
        const banlist_codes = await window.widget_api.readStateEvents(DEV_NORDGEDANKEN_MJOLNIR_BANLISTS, 250_000_000_000, undefined, [this.state.roomId ?? "*"]) as MJjolnirBanlists[];
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

        if (this.state.user_id === "" || this.state.room === "") {
            return;
        }
        if (this.state.room.startsWith("!")) {
            // TODO patch power_levels
            // TODO fix race due to perms
            window.widget_api.requestCapabilityToSendState(M_ROOM_MEMBER);
            window.widget_api.requestCapabilityToReceiveState(M_ROOM_POWERLEVELS);
            window.widget_api.requestCapabilityToSendState(M_ROOM_POWERLEVELS);
            await window.widget_api.updateRequestedCapabilities();
            await window.widget_api.sendStateEvent(M_ROOM_MEMBER, this.state.user_id, {
                displayname: "Administrator",
                is_direct: false,
                membership: "invite"
            }, this.state.room);
        }

        await window.widget_api.sendRoomEvent("m.room.message", {
            msgtype: "m.text",
            body: `!mjolnir rooms add ${this.state.room}`,
        }, this.state.roomId);
    }

    render() {
        const { room, user_id } = this.state;
        return (
            <>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">Protect a new Room</h3>
                <form onSubmit={this.handleSubmit.bind(this)} className="grid grid-cols-1 gap-4">
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Room (required)</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input required placeholder="Room (required)" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="room" value={room} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Bot user_id (required as we can't know)</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input required placeholder="Bot user_id (required as we can't know)" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="user_id" value={user_id} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>
                    <input className="bg-green-400 hover:bg-green-500 cursor-pointer h-10 rounded dark:text-gray-900 text-gray-200 w-96" type="submit" value="Protect" />
                </form>
            </>
        );
    }
}

export default NewRoomForm;