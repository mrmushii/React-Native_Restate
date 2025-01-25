import {Account, Avatars, Client, OAuthProvider} from "react-native-appwrite";
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
export const config = {
  plateform:'com.mush.restate',
  endpoint: process.env.EXPO_PUBLIC_APPRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPRITE_PROJECT_ID,
}

export const client = new Client();

client  
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.plateform!)

export const avatar = new Avatars(client);
export const account = new Account(client);


export async function login(){
  try{
    const redirectUri = Linking.createURL('/');
    const response = await account.createOAuth2Token(OAuthProvider.Google,redirectUri);

    if(!response) throw new Error("Failed To login");
    const browserResult = await AuthSession.openAuthSessionAsync(
      response.toString(),
      redirectUri
    )


    if(browserResult.type !== 'success') throw new Error("Failed to login");
    const url = new URL(browserResult.url);

    const secret = url.searchParams.get('secret')?.toString();
    const userid = url.searchParams.get('userid')?.toString();

    if (!secret || !userid) throw new Error("Failed to login");

    const session = await account.createSession(userid,secret);
    if(!session) throw new Error("Failed to create a session");

    return true;
    
    

  }catch(error){
    console.error(error);
    return false;
    
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error(error);
    return false;
    
  }
}

export async function getCurrentUser() {
  try {
    const response = await account.get();
    if(response.$id){
      const userAvatar = avatar.getInitials(response.name);
      return {
        ...response,
        avatar: userAvatar.toString(),
      }
    }
    
  } catch (error) {
    console.error(error);
    return null;
    
  }
}