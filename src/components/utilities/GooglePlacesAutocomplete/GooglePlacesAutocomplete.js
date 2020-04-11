import React, { Component } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import 'react-google-places-autocomplete/dist/index.min.css';
import './GooglePlacesAutocomplete.style.scss';
import { Input } from 'antd';
import { geocodeByAddress } from 'react-google-places-autocomplete';

/**
 * REMEMBER: Enable Maps Javascript API & Places API from Google Cloud Flatform
 */
export default class PlacesAutocomplete extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  async handleSelectPlace(e) {
    const { description } = e;
    const res = await geocodeByAddress(description);
    const placeInfo = {
      address: description,
      location: {
        lat: res[0].geometry.location.lat(),
        lng: res[0].geometry.location.lng()
      }
    };
    this.props.setAddress(placeInfo);
  }

  render() {
    return (
      <div className="google-places-autocomplete">
        <GooglePlacesAutocomplete
          placeholder="Tối đa 100 kí tự"
          suggestionsClassNames={{ suggestion: 'google-places-autocomplete__suggestions' }}
          onSelect={e => this.handleSelectPlace(e)}
          initialValue={this.props.initialValue}
          renderInput={(props) => (
            <Input {...props} maxLength={150} />
          )}
        />
      </div>
    )
  }
}
