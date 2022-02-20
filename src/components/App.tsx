import { PureComponent } from 'react';
import BanList from './forms/Banlist';
import Home from './Home';

type Pages = "banlist" | "home";

type Props = Record<string, unknown>;
type State = {
  current_page: Pages;
};

class App extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      current_page: "home"
    };
  }

  onBanListClick() {
    this.setState({
      current_page: "banlist"
    });
  }

  onHomeClick() {
    this.setState({
      current_page: "home"
    });
  }

  render() {
    const current_page = this.state.current_page;
    return (
      <div className="min-h-full flex flex-col justify-between bg-[#f8f8f8] dark:bg-[#06070D]">
        <header className='bg-[#f8f8f8] dark:bg-[#06070D] flex fixed top-0 left-0 right-0 lg:h-20 h-auto z-[100] items-center lg:flex-row flex-col shadow-black drop-shadow-xl'>
          <div className='flex lg:flex-1 items-center justify-between lg:flex-row flex-col'>
            <nav className='flex lg:flex-shrink-0 my-4'>
              <button className='px-4 h-auto min-w-[1.5rem] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium brightness-100 hover:brightness-75 duration-200 ease-in-out transition-all' onClick={this.onHomeClick.bind(this)}>Home</button>
              <button className='px-4 h-auto min-w-[1.5rem] flex items-center whitespace-nowrap cursor-pointer text-gray-900 dark:text-gray-200 font-medium brightness-100 hover:brightness-75 duration-200 ease-in-out transition-all' onClick={this.onBanListClick.bind(this)}>BanList</button>
            </nav>
          </div>
        </header>
        <div className='lg:pt-20 pt-52 z-0 max-h-full'>
          {
            current_page === "home" ? <Home /> : (current_page === "banlist" ? <BanList /> : <Home />)
          }
        </div>
      </div>
    );
  }
}

export default App;
