import { PureComponent } from 'react';
import BanForm from './forms/BanForm';
import KickForm from './forms/KickForm';
import RedactForm from './forms/RedactForm';

type Props = Record<string, unknown>;
type State = Record<string, unknown>;
class Home extends PureComponent<Props, State> {


    render() {
        return (
            <main className="m-8">
                <h1 className="text-3xl font-bold underline text-gray-900 dark:text-gray-200 mb-4">Home</h1>
                <div className='flex flex-row justify-center items-center flex-wrap'>
                    <div className='flex flex-row flex-wrap'>
                        <section className='mr-16 mb-16 max-w-full'>
                            <BanForm />
                        </section>
                        <section className='mr-16 mb-16 max-w-full'>
                            <KickForm />
                        </section>
                        <section className="max-w-full">
                            <RedactForm />
                        </section>
                    </div>
                </div>
            </main>
        );
    }
}

export default Home;