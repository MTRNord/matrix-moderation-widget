import { PureComponent } from 'react';

type Props = Record<string, unknown>;
type State = {
    mxid?: string;
    roomId?: string;
};
class Home extends PureComponent<Props, State> {

    constructor(props: Props | Readonly<Props>) {
        super(props);
        const urlParams = (new URL(window.location.href)).searchParams;
        const roomId = urlParams.get("room_id") ?? undefined;
        this.state = {
            roomId: roomId,
        } as State;
    }

    handleInputChange(event: { target: any; }) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        } as State);
    }

    async handleSubmit() {
        await window.widget_api.sendRoomEvent("m.room.message", {
            msgtype: "m.text",
            body: "widget test",
        }, this.state.roomId);
    }

    render() {
        const { mxid } = this.state;
        return (
            <main className="m-4">
                <h1 className="text-3xl font-bold underline text-gray-900 dark:text-gray-200 mb-4">Home</h1>
                <div className='flex flex-col'>
                    <section>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">Ban user</h3>
                        <form onSubmit={this.handleSubmit.bind(this)} className="w-96 grid grid-cols-1 gap-6">
                            <label className="block">
                                <span className="text-gray-900 dark:text-gray-200 visually-hidden">MXID</span>
                                <div className="mt-1 w-full flex flex-row box-border items-center cursor-text duration-300">
                                    <input placeholder="MXID" className="rounded py-1.5 px-2 min-w-[1.25rem] flex-[1] border-none placeholder:text-gray-900 text-gray-900" type="text" name="mxid" value={mxid} onChange={this.handleInputChange} />
                                </div>
                            </label>

                            <input className="bg-red-400 hover:bg-red-500 cursor-pointer h-10 rounded dark:text-gray-900 text-gray-200" type="submit" value="Ban User" />
                        </form>
                    </section>
                </div>
            </main>
        );
    }
}

export default Home;