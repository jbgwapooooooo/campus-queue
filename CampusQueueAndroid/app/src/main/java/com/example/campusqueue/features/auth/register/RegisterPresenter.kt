package com.example.campusqueue.features.auth.register
import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.RegisterRequest
import com.example.campusqueue.network.models.SupabaseAuthResponse
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterPresenter(private var view: RegisterContract.View?) : RegisterContract.Presenter {
    override fun register(email: String, password: String, name: String) {
        if (email.isEmpty() || password.isEmpty() || name.isEmpty()) {
            view?.showError("Fields cannot be empty")
            return
        }
        view?.showLoading()
        val request = RegisterRequest(email, password, mapOf("name" to name))
        RetrofitClient.instance.register(request).enqueue(object : Callback<SupabaseAuthResponse> {
            override fun onResponse(call: Call<SupabaseAuthResponse>, response: Response<SupabaseAuthResponse>) {
                view?.hideLoading()
                if (response.isSuccessful) view?.onRegisterSuccess()
                else {
                    val msg = try { 
                        val json = JSONObject(response.errorBody()?.string() ?: "")
                        json.optString("msg", json.optString("error_description", json.optString("message", "Registration Failed")))
                    } catch (e: Exception) { "Registration Failed" }
                    view?.showError(msg)
                }
            }
            override fun onFailure(call: Call<SupabaseAuthResponse>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network error: ${t.message}")
            }
        })
    }
    override fun onDestroy() { view = null }
}
