import { PureComponent } from 'react';
import BanForm from './BanForm';

type Props = Record<string, unknown>;
type State = Record<string, unknown>;
class Home extends PureComponent<Props, State> {


    render() {
        return (
            <main className="m-8">
                <h1 className="text-3xl font-bold underline text-gray-900 dark:text-gray-200 mb-4">Home</h1>
                <div className='flex flex-row justify-between'>
                    <section>
                        <BanForm />
                    </section>
                    <section>
                    </section>
                </div>
            </main>
        );
    }
}

export default Home;