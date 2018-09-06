export const STYLES = {
	treeStyle: {
		tree: {
			base: {
				listStyle: 'none',
				backgroundColor: 'white',
				margin: 0,
				padding: 0,
				fontFamily: '"Source Sans Pro", sans-serif',
				fontSize: '14px',
				width: 'max-content',
				minWidth: '100%'
			},
			node: {
				base: {
					position: 'relative'
				},
				link: {
					cursor: 'pointer',
					position: 'relative',
					padding: '0px 5px',
					display: 'block'
				},

				activeLink: {
					background: 'white'
				},
				toggle: {
					base: {
						position: 'relative',
						display: 'inline-block',
						verticalAlign: 'top',
						marginLeft: '-5px',
						marginRight: '-19px',
						height: '24px',
						width: '24px'
					},
					wrapper: {
						position: 'absolute',
						top: '50%',
						left: '50%',
						margin: '-12px 0px 0px -2px',
						height: '14px'
					},
					height: 8,
					width: 8,
					arrow: {
						fill: '#9DA5AB',
						strokeWidth: 0
					}
				},
				header: {
					base: {
						display: 'inline-block',
						verticalAlign: 'top',
						color: '#9DA5AB'
					},
					connector: {
						width: '2px',
						height: '12px',
						borderLeft: 'solid 2px black',
						borderBottom: 'solid 2px black',
						position: 'absolute',
						top: '0px',
						left: '-21px'
					},
					title: {
						lineHeight: '24px',
						verticalAlign: 'middle',
						marginLeft: '19px'
					}
				},
				subtree: {
					listStyle: 'none',
					paddingLeft: '19px'
				},
				loading: {
					color: '#E2C089'
				}
			}
		}
	},
	mapStyles: [
		{ featureType: 'water', stylers: [{ visibility: 'on' }, { color: '#bdd1f9' }] }, {
			featureType: 'all',
			elementType: 'labels.text.fill',
			stylers: [{ color: '#334165' }]
		}, { featureType: 'landscape', stylers: [{ color: '#e9ebf1' }] }, {
			featureType: 'road.highway',
			elementType: 'geometry',
			stylers: [{ color: '#c5c6c6' }]
		}, { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fff' }] }, {
			featureType: 'road.local',
			elementType: 'geometry',
			stylers: [{ color: '#fff' }]
		}, { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#d8dbe0' }] }, {
			featureType: 'poi',
			elementType: 'geometry',
			stylers: [{ color: '#cfd5e0' }]
		}, { featureType: 'administrative', stylers: [{ visibility: 'on' }, { lightness: 33 }] }, {
			featureType: 'poi.park',
			elementType: 'labels',
			stylers: [{ visibility: 'on' }, { lightness: 20 }]
		}, { featureType: 'road', stylers: [{ color: '#d8dbe0', lightness: 20 }] }],
	polygonStyle: {
		strokeColor: '#00FF00',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#00FF00',
		fillOpacity: 0.2
	},
	polygonHaulerStyle: {
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#FF0000',
		fillOpacity: 0.2
	},
	polygonRequestedHaulerStyle: {
		strokeColor: '#00FF00',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#00FF00',
		fillOpacity: 0.2
	}

}
