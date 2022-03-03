import { PureComponent } from "react";
import NewRoomForm from "./forms/NewRoomForm";

type Props = Record<string, unknown>;
type State = Record<string, unknown>;

export default class NewRoom extends PureComponent<Props, State> {
    render() {
        return (
            <main className="m-8">
                <h1 className="text-3xl font-bold underline text-gray-900 dark:text-gray-200 mb-4">Add new Room</h1>
                <div className='flex flex-row justify-center items-center flex-wrap'>
                    <div className='flex flex-row flex-wrap justify-start'>
                        <section className='mr-16 mb-16'>
                            <NewRoomForm />
                        </section>
                        <section className='mr-16 mb-16'>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-2">What will this do?</h3>
                            <p className="text-base font-normal text-gray-900 dark:text-gray-200 mb-2">
                                TODO explenation
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        );
    }
}