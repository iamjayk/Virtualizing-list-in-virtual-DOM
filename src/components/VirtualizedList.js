// @flow
import React, { type Element, Component, Fragment } from 'react';
import { FixedSizeList as List } from 'react-window';

const Row = ({ index, style, data, isScrolling }): Element<*> => {
	const extStyle = {
		...style,
		fontFamily: 'monospace',
		display: 'flex',
		alignItems: 'center',
	};
	const imgStyle = { borderRadius: '25px' };
	return (
		<div style={extStyle} key={data[index].id}>
			{isScrolling ? (
				<h4>Loading...</h4>
			) : (
				<Fragment>
					<img
						src={data[index].image}
						height={100}
						width={100}
						alt=""
						style={imgStyle}
					/>
					<p>{data[index].name}</p>
				</Fragment>
			)}
		</div>
	);
};

export default class VirtualizedList extends Component<any, any> {
	constructor (props: Object) {
		super(props);
		this.state = {
			items: [],
		};
	}

	componentDidMount () {
		fetch('https://rickandmortyapi.com/api/character/')
		.then(res => res.json())
		.then(res => res.results)
		.then(res => {
			const items = res.map(x => ({ id: x.id, name: x.name, image: x.image }));
			console.log(items);
			this.setState({ items });
		});
	}

	render (): Element<*> {
		return (
			<List
				height={300}
				itemCount={this.state.items.length}
				itemSize={130}
				itemData={this.state.items}
				width={300}
				useIsScrolling
			>
				{Row}
			</List>
		);
	}
}
