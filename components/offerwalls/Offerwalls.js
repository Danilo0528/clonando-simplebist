import Breadcrumb from '../Breadcrumb';
import BonusVotingBanner from './BonusVotingBanner';
import OfferwallCard from './OfferwallCard';

const offerwallsData = [
    { name: 'CPX Research', logo: 'https://admin.cpx-research.com/assets/cpx-research-logo-white.svg', rating: 5.00, users: 1037, bonus: '+15%' },
    { name: 'TimeWall', logo: 'https://timewall.io/images/logo-dark.png', rating: 4.90, users: 760, bonus: '+15%' },
    { name: 'Bitlabs', logo: 'https://bitlabs.ai/images/logo-light.svg', rating: 4.60, users: 542, bonus: '+10%' },
    { name: 'RevenueUniverse', logo: 'https://assets.ysense.com/assets/06232021/img/offer-partners/revenue-universe.png', rating: 4.50, users: 7297, bonus: '+10%' },
    { name: 'TheoremReach', logo: 'https://theoremreach.com/wp-content/uploads/2023/11/logo-white.svg', rating: 4.80, users: 726 },
    { name: 'Lootably', logo: 'https://lootably.com/assets/images/logo-text-white.png', rating: 4.70, users: 605 },
    { name: 'inBrain.ai', logo: 'https://inbrain.ai/images/logo-white.svg', rating: 4.60, users: 1000 },
    { name: 'MM Wall', logo: 'https://placehold.co/100x40/252736/FFFFFF?text=MM+Wall', rating: 4.40, users: 913 },
    { name: 'Adscendmedia', logo: 'https://adscendmedia.com/wp-content/uploads/2021/08/Adscend-Media-Logo-white-300x44.png', rating: 4.30, users: 2228 },
    { name: 'ayeT-Studios', logo: 'https://www.ayetstudios.com/images/logo-white.svg', rating: 4.20, users: 1645 },
    { name: 'AdGateMedia', logo: 'https://adgatemedia.com/wp-content/uploads/2021/08/logo-white-1.png', rating: 4.10, users: 574 },
    { name: 'Offertoro', logo: 'https://www.offertoro.com/assets/img/logo-white.png', rating: 4.00, users: 3640 },
    { name: 'Tasks.com', logo: 'https://placehold.co/100x40/252736/FFFFFF?text=Tasks', rating: 0, users: 0 },
    { name: 'AdGem', logo: 'https://adgem.com/wp-content/uploads/2018/03/logo-white.png', rating: 0, users: 0 },
    { name: 'drtowall', logo: 'https://placehold.co/100x40/252736/FFFFFF?text=drtowall', rating: 0, users: 0 },
];

const Offerwalls = () => {
    const breadcrumbItems = [{ label: 'Offerwalls' }];

    return (
        <section className="p-4 sm:p-6">
            <Breadcrumb items={breadcrumbItems} />
            <BonusVotingBanner />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {offerwallsData.map(offer => (
                    <OfferwallCard key={offer.name} offerwall={offer} />
                ))
            }</div>
        </section>
    );
};

export default Offerwalls;
