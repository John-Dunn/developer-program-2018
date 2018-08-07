import React, {Component} from 'react';
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

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
                    <font size="2">
                        Creator: <strong>{this.props.trade[0]}</strong> <br></br>
                        Active: <strong>{this.props.trade[4] ? 'active' : 'inactive'}</strong>. <br></br>
                        ERC721 token contract: <strong>{this.props.trade[1]}</strong> <br></br>
                        Offers: <strong>Token #{this.props.trade[2].toNumber()}</strong> Wants: <strong>Token #{this.props.trade[3].toNumber()}</strong> <br></br>
                    </font>
                    <Button>Cancel</Button>   <Button onClick={this.toggle}>Fill</Button>
                </CardText>
              </Card>
            </Col>

            <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
              <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
              <ModalBody>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
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
