package bootstrap.liftweb

import net.liftweb.http.{Req, LiftRules}
import com.example.angularaaexample.RestService

class Boot {
  def boot {
    LiftRules.dispatch append new RestService

    LiftRules.liftRequest.append{
      case Req("pages" :: _, _, _) => false
    }
  }
}