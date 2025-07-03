import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class GeolocationService {
  constructor() {}

  async getCurrentPosition(): Promise<GeolocationPosition> {
    // Check permission first
    const permissionStatus = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });

    if (permissionStatus.state === "denied") {
      throw new Error("Location access has been denied by the user.");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("User denied the request for Geolocation."));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("Location information is unavailable."));
              break;
            case error.TIMEOUT:
              reject(new Error("The request to get user location timed out."));
              break;
            default:
              reject(new Error("An unknown error occurred."));
              break;
          }
        }
      );
    });
  }
}
