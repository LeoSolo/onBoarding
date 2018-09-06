import * as Enums from '../types/enum'

interface MockungOptions {
    [key: string]: Array<any>
}

export const mockingOptions: MockungOptions = {
    state: [
	    'Alabama',
	    'Alaska',
	    'Arizona',
	    'Arkansas',
	    'California',
	    'Colorado',
	    'Connecticut',
	    'Delaware',
	    'District of Columbia',
	    'Florida',
	    'Georgia',
	    'Hawaii',
	    'Idaho',
	    'Illinois',
	    'Indiana',
	    'Iowa',
	    'Kansas',
	    'Kentucky',
	    'Louisiana',
	    'Maine',
	    'Montana',
	    'Nebraska',
	    'Nevada',
	    'New Hampshire',
	    'New Jersey',
	    'New Mexico',
	    'New York',
	    'North Carolina',
	    'North Dakota',
	    'Ohio',
	    'Oklahoma',
	    'Oregon',
	    'Maryland',
	    'Massachusetts',
	    'Michigan',
	    'Minnesota',
	    'Mississippi',
	    'Missouri',
	    'Pennsylvania',
	    'Rhode Island',
	    'South Carolina',
	    'South Dakota',
	    'Tennessee',
	    'Texas',
	    'Utah',
	    'Vermont',
	    'Virginia',
	    'Washington',
	    'West Virginia',
	    'Wisconsin',
	    'Wyoming'
    ],
    carsBrands: [
		'Cadillac',
        'Chevrolet',
        'Ford',
        'Dodge',
        'RAM',
        'GMC',
        'Honda',
	    'Isuzu',
	    'Toyota',
	    'Nissan',
	    'Jeep',
	    'Mitsubishi',
	    'Mercedes',
	    'Volkswagen',
		'Volvo'
    ],
    carsModels: [
        'Truck',
        'Sedan',
        'Hatchback',
        'Crossover',
        'Coupe'
    ],
    carsYears: [
		'2019',
        '2018',
        '2017',
        '2016',
        '2015',
        '2014',
        '2013',
        '2012',
        '2011',
        '2010'
    ],
	whoseHauler: [
		{ title: 'Independent Provider', value: Enums.HaulerType.INDEPENDENT_HAULER },
		{ title: 'Corporate Provider', value: Enums.HaulerType.DONATION_HAULER }
    ],
	carsProfiles: [
		{ title: 'Pickup truck only', value: Enums.CarProfileType.PICKUP_ONLY },
		{ title: 'Pickup with trailer', value: Enums.CarProfileType.PICKUP_WITH_TRAILER }
    ],
    hearAbout: [
	    'TV',
	    'Radio',
	    'Print (Newspaper, Magazines, etc.)',
	    'Outdoor (Billboards, etc.)',
	    'Referral',
	    'Trade Show',
	    'Web Search',
	    'Social Media',
	    'Craigslist',
	    'Other'
	],
	Cadillac: [
		'Other'
	],
	Chevrolet: [
		'Silverado 1500',
		'Silverado 2500',
		'S10',
		'Colorado',
		'Tahoe',
		'Suburban',
		'Other'
	],
	Ford: [
		'Ranger',
		'F150',
		'F250',
		'F350',
		'F450',
		'Transit',
		'Other'
	],
	Dodge: [
		'Dakota',
		'RAM 1500',
		'RAM 2500',
		'RAM 3500',
		'Other'
	],
	RAM: [
		'RAM 1500',
		'RAM 2500',
		'RAM 3500',
		'RAM 4500',
		'RAM 5500',
		'ProMaster',
		'Other'
	],
	GMC: [
		'Canyon',
		'Savana',
		'Sierra 1500',
		'Sierra 2500',
		'Sierra 3500',
		'Yukon 1500',
		'Yukon 2500',
		'TopKick',
		'Other'
	],
	Honda: [
		'Ridgeline',
		'Pilot',
		'Other'
	],
	Isuzu: [
		'i-280/i-350',
		'Hombre',
		'Rodeo',
		'Elf',
		'Forward',
		'Reach',
		'Kodiak',
		'D-Max',
		'Other'
	],
	Toyota: [
		'Tacoma',
		'Tundra',
		'Dyna',
		'Hilux',
		'Other'
	],
	Nissan: [
		'Atleon',
		'Frontier',
		'Cabstar',
		'ECO-T',
		'Trade',
		'Other'
	],
	Jeep: [
		'Commander',
		'Compass',
		'Grand Cherokee',
		'Liberty',
		'Patriot',
		'Wrangler',
		'Other'
	],
	Mitsubishi: [
		'L200 Triton',
		'Fuso FE180',
		'Canter FG635',
		'Pfau',
		'Other'
	],
	Mercedes: [
		'Sprinter',
		'X250',
		'Other'
	],
	Volkswagen: [
		'Crafter',
		'T4',
		'T5',
		'Transporter',
        'Other'
	],
	Volvo: [
		'FL7',
		'FL180',
		'Other'
	]
}
