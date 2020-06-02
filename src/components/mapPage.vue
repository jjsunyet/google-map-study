<template>
  <div class="container">
    <div class="search-component">
      <div class="pac-card" id="pac-card">
        <div class="type-selector-con">
          <div id="type-selector" class="pac-controls">
            <input class="radio-input" type="radio" name="type" id="changetype-all" checked="checked">
            <label for="changetype-all">All</label>

            <input class="radio-input" type="radio" name="type" id="changetype-establishment">
            <label for="changetype-establishment">Establishments</label>

            <input class="radio-input" type="radio" name="type" id="changetype-address">
            <label for="changetype-address">Addresses</label>

            <input class="radio-input" type="radio" name="type" id="changetype-geocode">
            <label for="changetype-geocode">Geocodes</label>
          </div>
          <div id="strict-bounds-selector" class="pac-controls">
            <input type="checkbox" id="use-strict-bounds" value="">
            <label for="use-strict-bounds">Strict Bounds</label>
          </div>
        </div>
        <div id="pac-container">
          <input id="pac-input" type="text"
                 placeholder="Enter a location">
        </div>
      </div>
    </div>
    <div id="infowindow-content">
      <img src="" width="16" height="16" id="place-icon">
      <span id="place-name"  class="title"></span><br>
      <span id="place-address"></span>
    </div>
    <div id="allMap" ref="all-map"></div>
    <div class="location-list-con" v-show="popupListVisible">
      <div @click="getCurrentPoiAddress(item,index)" v-for="(item,index) in locationList" class="list-item" :key="index">{{item.formatted_address}}</div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'mapPage',
  data () {
    return {
      locationList:[],
      popupListVisible:false,
      msg: 'Welcome to Your Vue.js App',
      loc:'39.40,116.90',
      map:null,
      geoCoder:null,
      infoWindow:null,
      maker:null,
      center:{lat: 40.731, lng: -73.997},
      service:null,
      autoComplete:null,
    }
  },
  methods:{
    //h5获取本机位置
    getLocation() {
//      debugger
      let geolocation = navigator.geolocation;
      if (geolocation) {
        geolocation.getCurrentPosition(this.showPosition);
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    },
    showPosition(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      _this.map.setCenter(new google.maps.LatLng(lat, lng));
    },
    initialize() {
      var loc = {};
      var geocoder = new google.maps.Geocoder();
//      debugger
      if(google.loader.ClientLocation) {
        loc.lat = google.loader.ClientLocation.latitude;
        loc.lng = google.loader.ClientLocation.longitude;

        var latlng = new google.maps.LatLng(loc.lat, loc.lng);
        geocoder.geocode({'latLng': latlng}, function(results, status) {
          if(status == google.maps.GeocoderStatus.OK) {
            alert(results[0]['formatted_address']);
          };
        });
      }
    },
    /*------------------以上废弃-------------------*/
    //选中时获取该地名相关列表，并且移动地图中心到该点
    getCurrentPoiAddress(item,index){
      console.log(item.geometry.location.lat()+','+item.geometry.location.lng(),"item.location")
      let latLng = {lat:item.geometry.location.lat(),lng:item.geometry.location.lng()};
    //放大到该点
//      this.map.setZoom(11)
      this.map.panTo(latLng);
      this.popupListVisible = false;
    },
    //点击回弹
    toggleBounce(){
      if (this.marker.getAnimation() !== null) {
        this.marker.setAnimation(null);
      } else {
        this.marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    },
    reverseGeoCoding(){
      let _this = this;
      var latlng = {lat: this.map.getCenter().lat(), lng:this.map.getCenter().lng()};
      this.geoCoder.geocode({'location': latlng}, function(results, status) {
        if(!_this.popupListVisible){
          _this.popupListVisible = true;
        }
        if (status === 'OK') {
          _this.locationList = [...results];
          console.log(results);
          if (results[0]) {
            _this.infoWindow.setContent(results[0].formatted_address);
            _this.infoWindow.open(_this.map, _this.marker);
          } else {
            window.alert('No results found');
          }
        } else {
//          console.log('Geocoder failed due to: ' + status)
        }
      });
    },
    //初始化地图
    initMap(mapData) {
      let _this = this;
      // 创建google地图
      _this.map = new google.maps.Map(document.getElementById("allMap"), {
        zoom: 8,
        center: this.center,
        zoomControl:true,
        mapTypeControl:true,
        streetViewControl:true,
        overviewMapControl:true,
      });
      //创建marker
      this.marker = new google.maps.Marker({
        position: _this.map.getCenter(),
        map: this.map,
        title: 'Click to zoom',
        clickable:true,
        draggable:false,
      });
      //点击跳动，并且放大
      _this.marker.addListener('click', _this.toggleBounce);
      this.geoCoder = new google.maps.Geocoder;
      this.infoWindow = new google.maps.InfoWindow;
      _this.reverseGeoCoding();
      //点击屏幕移动地图到该点
      google.maps.event.addListener(_this.map, 'click', function(event) {
        _this.map.setZoom(8);
        _this.map.panTo(event.latLng);
      });
      //当中心点发生变化时，重置maker的位置
      google.maps.event.addListener(_this.map, 'center_changed', function() {
        _this.marker.setPosition(_this.map.getCenter());
        _this.marker.setAnimation(google.maps.Animation.BOUNCE);
        _this.reverseGeoCoding();
      });
      //当点击marker时,放大显示点击的位置
      google.maps.event.addListener(_this.marker, 'click', function() {
//        _this.map.setZoom(11);
        _this.map.setCenter(_this.marker.getPosition());
        _this.reverseGeoCoding();
      });

      var card = document.getElementById('pac-card');
      var input = document.getElementById('pac-input');
      var types = document.getElementById('type-selector');
      var strictBounds = document.getElementById('strict-bounds-selector');

//      _this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
      console.log(document.getElementById('pac-input'))
      _this.autoComplete = new google.maps.places.Autocomplete(input);
      _this.autoComplete.bindTo('bounds', _this.map);
      _this.autoComplete.setFields(
        ['address_components', 'geometry', 'icon', 'name']);
      var infowindowContent = document.getElementById('infowindow-content');
      _this.infoWindow.setContent(infowindowContent);
      _this.autoComplete.addListener('place_changed', function() {
        _this.infoWindow.close();
        _this.marker.setVisible(false);
        debugger
        var place = _this.autoComplete.getPlace();
        if (!place.geometry) {
          // User entered the name of a Place that was not suggested and
          // pressed the Enter key, or the Place Details request failed.
          window.alert("No details available for input: '" + place.name + "'");
          return;
        }
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          _this.map.fitBounds(place.geometry.viewport);
        } else {
          _this.map.setCenter(place.geometry.location);
          _this.map.setZoom(17);  // Why 17? Because it looks good.
          _this.reverseGeoCoding()
        }
        _this.marker.setPosition(place.geometry.location);
        _this.marker.setVisible(true);

        var address = '';
        if (place.address_components) {
          address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ');
        }
        infowindowContent.children['place-icon'].src = place.icon;
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = address;
        _this.infoWindow.open(_this.map, _this.marker);
      });
      function setupClickListener(id, types) {
        var radioButton = document.getElementById(id);
        radioButton.addEventListener('click', function() {
          autocomplete.setTypes(types);
        });
      }

      setupClickListener('changetype-all', []);
      setupClickListener('changetype-address', ['address']);
      setupClickListener('changetype-establishment', ['establishment']);
      setupClickListener('changetype-geocode', ['geocode']);

      document.getElementById('use-strict-bounds')
        .addEventListener('click', function() {
          console.log('Checkbox clicked! New state=' + this.checked);
          _this.autocomplete.setOptions({strictBounds: this.checked});
        });
    },
    //地址逆解析
    geocodeLatLng() {
      var input = this.loc;
      var latlngStr = input.split(',', 2);
      var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
      let _this = this;
      this.geoCoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
          if (results[0]) {
//            debugger
            _this.map.setZoom(11);
            var marker = new google.maps.Marker({
              position: latlng,
              map: _this.map
            });
            _this.infoWindow.setContent(results[0].formatted_address);
            _this.infoWindow.open(this.map, _this.marker);
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
    },
  },
  mounted(){
    this.initMap(this.mapData)
  },
  watch:{}
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
  /deep/.gm-bundled-control-on-bottom{
    color: #333;
    .gmnoprint{
      position: fixed !important;
      top: 45% !important;
      left: auto !important;
      right: 2.5% !important;
    }
  }
  /deep/.gm-svpc{
    position: fixed !important;
    top: 60% !important;
    left: auto !important;
    right: 2.5% !important;
  }
  #infowindow-content .title {
    font-weight: bold;
  }
  #infowindow-content {
    display: none;
  }

  #allMap #infowindow-content {
    display: inline;
  }
  .container{
    width: 100%;
    height:100%;
    position: relative;
    .search-component{
      position: absolute;
      left: 0;
      top:4rem;
      width: 100%;
      height:4rem;
      background: #e4e4e4;
      z-index:1;
      .pac-card {
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        outline: none;
        background-color: rgba(245,245,245,1);
        font-family: Roboto;
        #pac-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-bottom: .5rem;
          #pac-input {
            display: inline-block;
            outline: none;
            border: none;
            width: 95%;
            height: 1.5rem;
            color: #666;
            background: rgba(255,255,255,1);
            border-radius: .25rem;
          }
          #pac-input:focus {
            border-color: #4d90fe;
          }
        }
        .type-selector-con{
          .pac-controls {
            display: inline-block;
            padding: 5px 11px;
          }
          .pac-controls label {
            font-family: Roboto;
            font-size: 13px;
            font-weight: 300;
          }
        }
      }
    }
    #allMap{
      width: 100%;
      height:100%;
    }
    .location-list-con{
      position: fixed;
      left:0;
      bottom: 0;
      width: 100%;
      height: 30%;
      overflow: auto;
      background: rgba(245,245,245,1);
      .list-item{
        width: 100%;
        min-height:2rem;
        line-height: 2rem;
        font-size: 1rem;
        color: #333;
        border-bottom: 1px solid #e4e4e4;
      }
    }
  }
</style>
