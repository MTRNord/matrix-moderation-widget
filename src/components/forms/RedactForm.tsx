import { PureComponent } from "react";
type Props = Record<string, unknown>;
type State = {
    user: string;
    event: string;
    limit: string;
    room: string;
    roomId?: string;
};
class RedactForm extends PureComponent<Props, State> {
    constructor(props: Props | Readonly<Props>) {
        super(props);
        const urlParams = (new URL(window.location.href)).searchParams;
        const roomId = urlParams.get("room_id") ?? undefined;
        this.state = {
            user: "",
            event: "",
            room: "",
            limit: "",
            roomId: roomId
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

        let command = "";
        if (this.state.event !== "" && this.state.user === "" && this.state.room === "" && this.state.limit === "") {
            command = `!mjolnir redact ${this.state.event}`;
        } else if (this.state.event === "" && this.state.user !== "" && this.state.room === "" && this.state.limit === "") {
            command = `!mjolnir redact ${this.state.user}`;
        } else if (this.state.event === "" && this.state.user !== "" && this.state.room !== "" && this.state.limit === "") {
            command = `!mjolnir redact ${this.state.user} ${this.state.room}`;
        } else if (this.state.event === "" && this.state.user !== "" && this.state.room !== "" && this.state.limit !== "") {
            command = `!mjolnir redact ${this.state.user} ${this.state.room} ${this.state.limit}`;
        } else if (this.state.event === "" && this.state.user !== "" && this.state.room === "" && this.state.limit !== "") {
            command = `!mjolnir redact ${this.state.user} ${this.state.limit}`;
        } else {
            return;
        }
        await window.widget_api.sendRoomEvent("m.room.message", {
            msgtype: "m.text",
            body: command,
        }, this.state.roomId);
    }

    render() {
        const { user, room, limit, event } = this.state;
        return (
            <>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">Redact</h3>
                <h4 className="text-gray-900 dark:text-gray-200 text-base font-thin mb-2 w-96 italic">(Note that this goes with the same combinations as the commands. Make sure empty fields are empty when submitting!)</h4>
                <form onSubmit={this.handleSubmit.bind(this)} className="grid grid-cols-1 gap-4">
                    <h4 className="text-gray-900 dark:text-gray-200 text-lg font-normal mb-1 w-96">Redacting a user</h4>
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">User ID (required if Event Permalink empty)</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input disabled={event !== ""} required={event === ""} placeholder="User ID (required if Permalink empty)" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="user" value={user} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Room (optional)</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input disabled={event !== ""} placeholder="Room (optional)" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="room" value={room} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Limit (optional)</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input disabled={event !== ""} placeholder="Limit (optional)" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="limit" value={limit} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>
                    <h4 className="text-gray-900 dark:text-gray-200 text-lg font-normal mb-1 w-96">Redacting an event</h4>
                    <label className="block w-96">
                        <span className="text-gray-900 dark:text-gray-200 visually-hidden mb-2">Event Permalink (required if User ID empty)</span>
                        <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300 max-w-full">
                            <input disabled={user !== ""} required={user === ""} placeholder="Event Permalink (required if User ID empty)" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="event" value={event} onChange={this.handleInputChange.bind(this)} />
                        </div>
                    </label>

                    <input className="bg-blue-400 hover:bg-blue-500 cursor-pointer h-10 rounded dark:text-gray-900 text-gray-200 w-96" type="submit" value="Redact" />
                </form>
            </>
        );
    }
}

export default RedactForm;