import React, { Component } from 'react';
import Geocode from "react-geocode";
import GoogleMapReact from 'google-map-react';
import './GoogleMap.style.scss';
import { Tooltip } from 'antd';
import GOOGLE_MAPS from '../../../constants/google-maps.constant';

const defaultLocation = { lat: 0, lng: 0 };
const defaultAddress = 'Unknown';

const LocationIndicator = ({ icon, text }) => (
  <div className="google-map__location-icon">
    <Tooltip title={text} placement="right">
      {icon}
    </Tooltip>
  </div>
);

/**
 * REMEMBER: Enable Geocoding API from Google Cloud Flatform
 */
export default class GoogleMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: defaultAddress,
      location: defaultLocation
    }
  }

  async componentWillReceiveProps(props) {
    const { address } = props;
    const location = await this.getAddressLocation(address);
    this.setState({
      address: address || defaultAddress,
      location
    });
  }

  async getAddressText(latitude, longitude) {
    try {
      const res = await Geocode.fromLatLng(
        latitude,
        longitude,
        GOOGLE_MAPS.API_KEY,
        GOOGLE_MAPS.GEOCODING.LANGUAGE,
        GOOGLE_MAPS.GEOCODING.REGION
      );
      return res.results[0].formatted_address;
    } catch (error) {
      return defaultAddress;
    }
  }

  async getAddressLocation(address) {
    try {
      if (!address)
        return defaultLocation;

      const res = await Geocode.fromAddress(
        address,
        GOOGLE_MAPS.API_KEY,
        GOOGLE_MAPS.GEOCODING.LANGUAGE,
        GOOGLE_MAPS.GEOCODING.REGION
      );
      return res.results[0].geometry.location;
    } catch (error) {
      return defaultLocation;
    }
  }

  render() {
    const { width, height, locationIcon } = this.props;
    const { location, address } = this.state;

    return (
      <div className="google-map" style={{ width, height }}>
        <GoogleMapReact
          apiKey={GOOGLE_MAPS.API_KEY}
          center={location}
          defaultZoom={15}
        >
          <LocationIndicator
            lat={location.lat}
            lng={location.lng}
            icon={locationIcon}
            text={address}
          />
        </GoogleMapReact>
      </div>
    )
  }
}