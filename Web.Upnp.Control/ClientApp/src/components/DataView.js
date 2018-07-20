import React from "react";

export default class DataView extends React.Component {

    displayName = DataView.name;

    render() {
        const { selector = (context => context), dataContext,
            containerTemplate: Container = "ul", containerProps,
            itemTemplate: Item = "li", itemProps,
            headerTemplate: Header, headerProps,
            footerTemplate: Footer, footerProps,
            className } = this.props;
        return <div className={className}>
                   {Header && <Header data-context={dataContext} {...headerProps} />}
                   <Container data-context={dataContext} {...containerProps}>
                       {[
                           selector(dataContext).map((e, index) =>
                               <Item key={index} data-source={e} data-row-id={index} {...itemProps} />)
                       ]}
                   </Container>
                   {Footer && <Footer data-context={dataContext} {...footerProps} />}
               </div>;
    }
}