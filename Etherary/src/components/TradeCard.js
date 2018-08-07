import React, {Component} from 'react';
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


class TradeInfo extends Component {
    render() {
        return(
            <font size="2">
                Creator: <strong>{this.props.trade[0]}</strong> <br></br>
                Active: <strong>{this.props.trade[4] ? 'Yes' : 'No'}</strong>. <br></br>
                ERC721 token contract: <strong>{this.props.trade[1]}</strong> <br></br>
                Offers: <strong>Token #{this.props.trade[2].toNumber()}</strong> Wants: <strong>Token #{this.props.trade[3].toNumber()}</strong> <br></br>
            </font>
        )
    }
}



class TradeCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
          modal: false
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
      this.setState({
        modal: !this.state.modal
      });
    }

    render() {
        return (
            <div>
            <Col sm="6">
              <Card body>
                <CardTitle>Trade #{this.props.orderId}</CardTitle>
                <CardText>
                        <TradeInfo trade={this.props.trade}/>
                    <Button>Cancel</Button>   <Button onClick={this.toggle}>Fill</Button>
                </CardText>
              </Card>
            </Col>

            <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
              <ModalHeader toggle={this.toggle}>Filling trade #{this.props.orderId}</ModalHeader>
              <ModalBody>
                <TradeInfo trade={this.props.trade} />
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={this.toggle}>Do Something</Button>{' '}
                <Button color="secondary" onClick={this.toggle}>Cancel</Button>
              </ModalFooter>
            </Modal>
            </div>

        );
    }

};

export default TradeCard;
