import { PureComponent } from "react";

type Props = Record<string, unknown>;
type State = {
    user: string;
    reason: string;
    roomId?: string;
    room: string;
};

class KickForm extends PureComponent<Props, State> {
    constructor(props: Props | Readonly<Props>) {
        super(props);
        const urlParams = (new URL(window.location.href)).searchParams;
        const roomId = urlParams.get("room_id") ?? undefined;
        this.state = {
            user: "",
            reason: "",
            roomId: roomId,
            room: ""
        };
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

        const { user, room, reason, roomId } = this.state;

        if (user === "") {
            // TODO display warning
            return;
        } else {
            if (room === "") {
                await window.widget_api.sendRoomEvent("m.room.message", {
                    msgtype: "m.text",
                    body: `!mjolnir kick ${user} ${reason}`,
                }, roomId);
            } else if (reason === "") {
                await window.widget_api.sendRoomEvent("m.room.message", {
                    msgtype: "m.text",
                    body: `!mjolnir kick ${user} ${room}`,
                }, roomId);
            } else {
                await window.widget_api.sendRoomEvent("m.room.message", {
                    msgtype: "m.text",
                    body: `!mjolnir kick ${user}`,
                }, roomId);
            }
        }
    }

    render() {
        const { user, room, reason } = this.state;
        return (
            <>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">Kick</h3>
                <form onSubmit={this.handleSubmit.bind(this)} className="grid grid-cols-1 gap-4">
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">User ID</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input aria-label="User identifier" aria-required="true" required placeholder="User ID" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="user" value={user} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Room Alias/ID</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input aria-label="Room Alias or Room identifier" aria-required="false" placeholder="Room Alias/ID" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="room" value={room} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Reason</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input aria-label="Reason" aria-required="false" placeholder="Reason" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="reason" value={reason} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>

                    <input className="bg-yellow-400 hover:bg-yellow-500 cursor-pointer h-10 rounded dark:text-gray-900 text-gray-200 w-96" type="submit" value="Kick" />
                </form>
            </>
        );
    }
}

export default KickForm;