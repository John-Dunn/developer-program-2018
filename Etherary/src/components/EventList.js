import React, {Component} from 'react'

class EventList extends Component {

    createEntries(data) {
        var eventRows = data.map(function(event, key) {
            var outputString = '';
            Object.keys(event.args).forEach(function(key,index) {
                console.log(key)
                console.log()
                outputString += key;
                outputString += ' = ';
                outputString += event.args[key];
                outputString += '  ';
            });

            return (
                <div key={key}>Block {event.blockNumber}: {event.event}. Properties: {outputString} </div>
            )
        }, this)
        return eventRows;
    }

    render() {
        return (
            <div>
                <h2> Events </h2>
                {
                    this.props.events.length > 0
                    ? this.createEntries(this.props.events)
                    : 'There are no events to display'
                }
            </div>
        )
    }
}

export default EventList
